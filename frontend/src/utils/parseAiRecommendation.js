const parseObject = (value) => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const primaryFont = value.primaryFont || value.primary_font;
  const secondaryFont = value.secondaryFont || value.secondary_font;
  const rationale = value.rationale || value.reasoning || value.explanation;

  if (!primaryFont || !secondaryFont || !rationale) {
    return null;
  }

  return {
    primaryFont: String(primaryFont),
    secondaryFont: String(secondaryFont),
    rationale: String(rationale),
    useCases: Array.isArray(value.useCases) ? value.useCases.map(String) : [],
    googleFontsLinks: Array.isArray(value.googleFontsLinks)
      ? value.googleFontsLinks.map(String)
      : [],
  };
};

export const parseAiRecommendation = (rawText) => {
  const text = String(rawText || "").trim();
  if (!text) {
    return null;
  }

  try {
    return parseObject(JSON.parse(text));
  } catch {
    // Continue with fallback extraction.
  }

  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || firstBrace >= lastBrace) {
    return null;
  }

  const possibleJson = text.slice(firstBrace, lastBrace + 1);

  try {
    return parseObject(JSON.parse(possibleJson));
  } catch {
    return null;
  }
};
