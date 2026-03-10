import type { PageCapture } from "./page-capture";
import { buildUserPrompt, SYSTEM_PROMPT } from "./prompt";
import { normalizeRecipeDocument, recipeDocumentJsonSchema, type RecipeDocument } from "./recipe-schema";

type OpenAiSettings = {
  apiKey: string;
  model: string;
};

function extractResponseText(payload: Record<string, unknown>): string {
  if (typeof payload.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text;
  }

  const outputs = Array.isArray(payload.output) ? payload.output : [];

  for (const output of outputs) {
    if (!output || typeof output !== "object") {
      continue;
    }

    const content = Array.isArray((output as { content?: unknown }).content) ? (output as { content: unknown[] }).content : [];

    for (const item of content) {
      if (!item || typeof item !== "object") {
        continue;
      }

      const text = (item as { text?: unknown }).text;
      if (typeof text === "string" && text.trim()) {
        return text;
      }
    }
  }

  throw new Error("OpenAI gaf geen bruikbare tekstuele output terug.");
}

export async function buildRecipeDocument(
  capture: PageCapture,
  manualNotes: string,
  settings: OpenAiSettings
): Promise<RecipeDocument> {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${settings.apiKey}`
    },
    body: JSON.stringify({
      model: settings.model,
      input: [
        {
          role: "system",
          content: [{ type: "input_text", text: SYSTEM_PROMPT }]
        },
        {
          role: "user",
          content: [{ type: "input_text", text: buildUserPrompt(capture, manualNotes) }]
        }
      ],
      max_output_tokens: 4000,
      text: {
        format: {
          type: "json_schema",
          name: "recipe_document",
          strict: true,
          schema: recipeDocumentJsonSchema
        }
      }
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenAI request mislukt (${response.status}): ${errorBody}`);
  }

  const payload = (await response.json()) as Record<string, unknown>;
  const responseText = extractResponseText(payload);
  const parsed = JSON.parse(responseText) as unknown;
  const document = normalizeRecipeDocument(parsed);

  return {
    ...document,
    extraction: {
      ...document.extraction,
      model: settings.model
    }
  };
}
