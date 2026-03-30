import { Groq } from "groq-sdk";

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
  console.warn("GROQ_API_KEY is not set. Chat endpoint will fail until configured.");
}

export const groq = new Groq({
  apiKey: apiKey || "",
});

export const getModelName = () => process.env.GROQ_MODEL || "openai/gpt-oss-20b";
