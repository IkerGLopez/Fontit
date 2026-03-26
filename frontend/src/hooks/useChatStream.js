import { useCallback, useRef, useState } from "react";
import { streamChat } from "../services/chatService";

export const useChatStream = () => {
  const abortControllerRef = useRef(null);

  const [responseText, setResponseText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastMessage, setLastMessage] = useState("");

  const stopStreaming = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setIsLoading(false);
  }, []);

  const submitMessage = useCallback(async (message) => {
    abortControllerRef.current?.abort();

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setResponseText("");
    setError("");
    setIsLoading(true);
    setLastMessage(message);

    try {
      await streamChat({
        message,
        signal: abortController.signal,
        onToken: (token) => {
          setResponseText((prev) => prev + token);
        },
        onDone: () => {
          setIsLoading(false);
        },
        onError: (details) => {
          setError(details || "The assistant failed while streaming.");
          setIsLoading(false);
        },
      });
    } catch (streamError) {
      if (abortController.signal.aborted) {
        setError("");
        setIsLoading(false);
        return;
      }

      if (streamError?.message === "Request cancelled") {
        setError("");
        setIsLoading(false);
        return;
      }

      setError(streamError?.message || "Unexpected chat error");
      setIsLoading(false);
    } finally {
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null;
      }
    }
  }, []);

  const retryLastMessage = useCallback(async () => {
    if (!lastMessage.trim()) {
      return;
    }

    await submitMessage(lastMessage);
  }, [lastMessage, submitMessage]);

  return {
    responseText,
    isLoading,
    error,
    lastMessage,
    submitMessage,
    retryLastMessage,
    stopStreaming,
  };
};
