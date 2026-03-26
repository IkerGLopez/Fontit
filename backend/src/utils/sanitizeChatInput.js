const MAX_MESSAGE_LENGTH = 1400;

export const sanitizeChatInput = (value) => {
  const text = String(value || "");

  return text
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

export const validateChatInput = (value) => {
  const sanitized = sanitizeChatInput(value);

  if (!sanitized) {
    return {
      ok: false,
      statusCode: 400,
      error: "Invalid input",
      details: "message must be a non-empty string",
    };
  }

  if (sanitized.length > MAX_MESSAGE_LENGTH) {
    return {
      ok: false,
      statusCode: 400,
      error: "Input too long",
      details: `message must be ${MAX_MESSAGE_LENGTH} characters or less`,
    };
  }

  return {
    ok: true,
    sanitized,
  };
};

export const CHAT_MAX_LENGTH = MAX_MESSAGE_LENGTH;
