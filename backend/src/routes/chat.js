import { Router } from "express";
import { randomUUID } from "node:crypto";
import { getModelName, openrouter } from "../services/openRouterClient.js";
import { validateChatInput } from "../utils/sanitizeChatInput.js";

const chatRouter = Router();

const sendSseEvent = (res, event, data) => {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
};

chatRouter.post("/stream", async (req, res) => {
  const requestId = randomUUID();
  const startedAt = Date.now();
  const validation = validateChatInput(req.body?.message);

  if (!validation.ok) {
    console.warn(`[chat][${requestId}] invalid input: ${validation.details}`);
    return res.status(validation.statusCode).json({
      error: validation.error,
      details: validation.details,
      requestId,
    });
  }

  const message = validation.sanitized;
  const timeoutMs = Number(process.env.OPENROUTER_TIMEOUT_MS || 45000);

  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.setHeader("X-Request-Id", requestId);
  res.flushHeaders?.();

  console.info(`[chat][${requestId}] stream started model=${getModelName()}`);
  sendSseEvent(res, "meta", { requestId });

  let clientClosed = false;
  res.on("close", () => {
    clientClosed = true;
    console.info(`[chat][${requestId}] connection closed by client after ${Date.now() - startedAt}ms`);
  });

  try {
    const stream = await openrouter.chat.send({
      chatGenerationParams: {
        model: getModelName(),
        stream: true,
        messages: [
          {
            role: "system",
            content:
              "You are a senior UI/UX design expert specialized in web typography. Recommend clear font pairings and explain why they fit the user's context.",
          },
          {
            role: "user",
            content: message,
          },
        ],
      },
    }, {
      timeoutMs,
    });

    for await (const chunk of stream) {
      if (clientClosed) {
        break;
      }

      const token = chunk.choices?.[0]?.delta?.content;
      if (token) {
        sendSseEvent(res, "token", { token });
      }

      if (chunk.usage) {
        sendSseEvent(res, "usage", {
          reasoningTokens: chunk.usage.reasoningTokens || 0,
        });
      }
    }

    if (!clientClosed) {
      sendSseEvent(res, "done", { done: true });
      res.end();
      console.info(`[chat][${requestId}] stream completed in ${Date.now() - startedAt}ms`);
    }
  } catch (error) {
    console.error(`[chat][${requestId}] streaming error:`, error);

    const isTimeout = error?.name === "RequestTimeoutError" || /timeout/i.test(error?.message || "");
    const details = isTimeout
      ? "The AI provider took too long to respond. Please retry."
      : error?.message || "Unknown error";

    if (!res.headersSent) {
      return res.status(isTimeout ? 504 : 500).json({
        error: "Chat stream failed",
        details,
        requestId,
      });
    }

    sendSseEvent(res, "error", {
      error: "Chat stream failed",
      details,
      requestId,
    });
    res.end();
  }
});

export default chatRouter;
