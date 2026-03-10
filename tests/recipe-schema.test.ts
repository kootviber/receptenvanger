import { describe, expect, it } from "vitest";
import { normalizeRecipeDocument } from "../src/lib/recipe-schema";

describe("normalizeRecipeDocument", () => {
  it("reindexes steps and keeps defaults", () => {
    const document = normalizeRecipeDocument({
      schema_version: "1.0",
      source: {
        url: "https://example.com/recipe",
        canonical_url: null,
        page_title: "Recipe page",
        site_name: "Example",
        language: "en",
        captured_at: "2026-03-10T00:00:00.000Z",
        extraction_strategy: "hybrid"
      },
      recipe: {
        title: "Tomatensoep",
        description: "",
        yield_text: "",
        servings: 2,
        prep_time_minutes: 10,
        cook_time_minutes: 20,
        total_time_minutes: 30,
        ingredients: [
          {
            id: "ingredient-a",
            section: "main",
            name: "Tomaten",
            quantity: 4,
            unit: null,
            quantity_text: "4",
            preparation: "",
            notes: "",
            optional: false
          }
        ],
        steps: [
          {
            index: 9,
            section: "main",
            title: "",
            instructions: "Kook alles samen.",
            duration_minutes: 20
          }
        ],
        tags: ["soup"],
        cuisine: "",
        course: "",
        diet: [],
        equipment: [],
        tips: []
      },
      extraction: {
        confidence: "high",
        warnings: [],
        missing_fields: [],
        model: "gpt-4.1-mini",
        generated_at: "2026-03-10T00:00:00.000Z"
      }
    });

    expect(document.recipe.steps[0].index).toBe(1);
    expect(document.recipe.ingredients[0].id).toBe("ingredient-a");
  });
});
