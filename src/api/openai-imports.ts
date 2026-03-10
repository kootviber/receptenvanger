import { buildRecipeDocument } from "../lib/openai";
import type { PageCapture } from "../lib/page-capture";
import { normalizeRecipeDocument, recipeDocumentJsonSchema, type RecipeDocument } from "../lib/recipe-schema";

type OpenAiServerSettings = {
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

export async function buildRecipeDocumentFromCapture(
  capture: PageCapture,
  manualNotes: string,
  settings: OpenAiServerSettings
): Promise<RecipeDocument> {
  return buildRecipeDocument(capture, manualNotes, settings);
}

export async function buildRecipeDocumentFromImage(input: {
  imageBase64: string;
  mimeType: string;
  sourceUrl?: string;
  manualNotes: string;
  settings: OpenAiServerSettings;
}): Promise<RecipeDocument> {
  const imageUrl = input.imageBase64.startsWith("data:")
    ? input.imageBase64
    : `data:${input.mimeType};base64,${input.imageBase64}`;

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${input.settings.apiKey}`
    },
    body: JSON.stringify({
      model: input.settings.model,
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text:
                "Je ziet een screenshot of afbeelding van een recept. Zet deze om naar een recipe_document. Gebruik null voor onbekende url. Verzin geen ontbrekende ingredienten of hoeveelheden. Gebruik warnings als de afbeelding onduidelijk is."
            }
          ]
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: JSON.stringify(
                {
                  task: "Maak een recipe_document uit deze afbeelding.",
                  source_url: input.sourceUrl ?? null,
                  manual_notes: input.manualNotes
                },
                null,
                2
              )
            },
            {
              type: "input_image",
              image_url: imageUrl
            }
          ]
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
    throw new Error(`OpenAI image request mislukt (${response.status}): ${errorBody}`);
  }

  const payload = (await response.json()) as Record<string, unknown>;
  const document = normalizeRecipeDocument(JSON.parse(extractResponseText(payload)) as unknown);

  return {
    ...document,
    extraction: {
      ...document.extraction,
      model: input.settings.model
    }
  };
}
