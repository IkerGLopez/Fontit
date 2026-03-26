import { OpenRouter } from "@openrouter/sdk";

const apiKey = process.env.OPENROUTER_API_KEY;

if (!apiKey) {
  console.warn("OPENROUTER_API_KEY is not set. Chat endpoint will fail until configured.");
}

export const openrouter = new OpenRouter({
  apiKey: apiKey || "",
});

export const getModelName = () => process.env.OPENROUTER_MODEL || "openrouter/free";
