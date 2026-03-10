import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

const ingredientSchema = z.object({
  id: z.string().min(1),
  section: z.string().default("main"),
  name: z.string().min(1),
  quantity: z.number().nullable().default(null),
  unit: z.string().nullable().default(null),
  quantity_text: z.string().default(""),
  preparation: z.string().default(""),
  notes: z.string().default(""),
  optional: z.boolean().default(false)
});

const stepSchema = z.object({
  index: z.number().int().positive(),
  section: z.string().default("main"),
  title: z.string().default(""),
  instructions: z.string().min(1),
  duration_minutes: z.number().int().nonnegative().nullable().default(null)
});

export const recipeDocumentSchema = z.object({
  schema_version: z.literal("1.0"),
  source: z.object({
    url: z.string().url().nullable().default(null),
    canonical_url: z.string().url().nullable().default(null),
    page_title: z.string().default(""),
    site_name: z.string().default(""),
    language: z.string().default("unknown"),
    captured_at: z.string().min(1),
    extraction_strategy: z.enum(["json_ld", "dom", "hybrid", "manual"])
  }),
  recipe: z.object({
    title: z.string().min(1),
    description: z.string().default(""),
    yield_text: z.string().default(""),
    servings: z.number().int().positive().nullable().default(null),
    prep_time_minutes: z.number().int().nonnegative().nullable().default(null),
    cook_time_minutes: z.number().int().nonnegative().nullable().default(null),
    total_time_minutes: z.number().int().nonnegative().nullable().default(null),
    ingredients: z.array(ingredientSchema).min(1),
    steps: z.array(stepSchema).min(1),
    tags: z.array(z.string()).default([]),
    cuisine: z.string().default(""),
    course: z.string().default(""),
    diet: z.array(z.string()).default([]),
    equipment: z.array(z.string()).default([]),
    tips: z.array(z.string()).default([])
  }),
  extraction: z.object({
    confidence: z.enum(["low", "medium", "high"]),
    warnings: z.array(z.string()).default([]),
    missing_fields: z.array(z.string()).default([]),
    model: z.string().min(1),
    generated_at: z.string().min(1)
  })
});

export type RecipeDocument = z.infer<typeof recipeDocumentSchema>;

export function normalizeRecipeDocument(candidate: unknown): RecipeDocument {
  const parsed = recipeDocumentSchema.parse(candidate);

  return {
    ...parsed,
    recipe: {
      ...parsed.recipe,
      ingredients: parsed.recipe.ingredients.map((ingredient, index) => ({
        ...ingredient,
        id: ingredient.id || `ingredient-${index + 1}`
      })),
      steps: parsed.recipe.steps.map((step, index) => ({
        ...step,
        index: index + 1
      }))
    }
  };
}

const rawJsonSchema = zodToJsonSchema(recipeDocumentSchema, {
  name: "recipe_document"
});

function sanitizeJsonSchema(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeJsonSchema(item));
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  const result: Record<string, unknown> = {};

  for (const [key, nestedValue] of Object.entries(value)) {
    if (key === "$schema" || key === "default" || key === "format") {
      continue;
    }

    result[key] = sanitizeJsonSchema(nestedValue);
  }

  if (
    result.type === "object" &&
    result.properties &&
    typeof result.properties === "object" &&
    !Array.isArray(result.properties)
  ) {
    result.required = Object.keys(result.properties as Record<string, unknown>);
  }

  return result;
}

export const recipeDocumentJsonSchema =
  "definitions" in rawJsonSchema && rawJsonSchema.definitions && "recipe_document" in rawJsonSchema.definitions
    ? sanitizeJsonSchema(rawJsonSchema.definitions.recipe_document)
    : sanitizeJsonSchema(rawJsonSchema);
