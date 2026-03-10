import { describe, expect, it } from "vitest";
import { openDatabase } from "../src/api/database";
import { RecipeRepository } from "../src/api/repository";
import { normalizeRecipeDocument } from "../src/lib/recipe-schema";

describe("RecipeRepository", () => {
  it("stores a recipe document and lists it back", () => {
    const database = openDatabase(":memory:");
    const repository = new RecipeRepository(database);
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
        title: "Pasta",
        description: "",
        yield_text: "",
        servings: 2,
        prep_time_minutes: 10,
        cook_time_minutes: 15,
        total_time_minutes: 25,
        ingredients: [
          {
            id: "ingredient-1",
            section: "main",
            name: "Pasta",
            quantity: 250,
            unit: "g",
            quantity_text: "250 g",
            preparation: "",
            notes: "",
            optional: false
          }
        ],
        steps: [
          {
            index: 1,
            section: "main",
            title: "",
            instructions: "Kook de pasta.",
            duration_minutes: 10
          }
        ],
        tags: ["italian"],
        cuisine: "Italian",
        course: "Dinner",
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

    const saved = repository.saveRecipeDocument(document, {
      sourceType: "json"
    });

    const recipes = repository.listRecipes();
    const stored = repository.getRecipe(saved.recipeId);

    expect(recipes).toHaveLength(1);
    expect(recipes[0].title).toBe("Pasta");
    expect(stored).not.toBeNull();
  });

  it("lets a second user save a public recipe into a personal recipe book", () => {
    const database = openDatabase(":memory:");
    const repository = new RecipeRepository(database);
    const owner = repository.createUser("Owner");
    const collector = repository.createUser("Collector");

    const document = normalizeRecipeDocument({
      schema_version: "1.0",
      source: {
        url: "https://example.com/public-recipe",
        canonical_url: null,
        page_title: "Public recipe",
        site_name: "Example",
        language: "en",
        captured_at: "2026-03-10T00:00:00.000Z",
        extraction_strategy: "manual"
      },
      recipe: {
        title: "Publieke curry",
        description: "",
        yield_text: "",
        servings: 4,
        prep_time_minutes: 15,
        cook_time_minutes: 25,
        total_time_minutes: 40,
        ingredients: [
          {
            id: "ingredient-1",
            section: "main",
            name: "Kikkererwten",
            quantity: 1,
            unit: "blik",
            quantity_text: "1 blik",
            preparation: "",
            notes: "",
            optional: false
          }
        ],
        steps: [
          {
            index: 1,
            section: "main",
            title: "",
            instructions: "Laat zacht pruttelen.",
            duration_minutes: 25
          }
        ],
        tags: ["public"],
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
        model: "manual",
        generated_at: "2026-03-10T00:00:00.000Z"
      }
    });

    const saved = repository.saveRecipeDocument(document, {
      sourceType: "json",
      ownerUserId: owner.userId,
      visibility: "public"
    });

    const collectorBooks = repository.listUserBooks(collector.userId);
    repository.saveRecipeToBook({
      userId: collector.userId,
      bookId: collectorBooks[0].id,
      recipeId: saved.recipeId,
      rating: 5,
      notes: "Bewaren voor later",
      extraTags: ["family"]
    });

    const publicRecipes = repository.listPublicRecipes();
    const collectorRecipes = repository.listRecipesForUser(collector.userId);

    expect(publicRecipes).toHaveLength(1);
    expect(publicRecipes[0].title).toBe("Publieke curry");
    expect(collectorRecipes).toHaveLength(1);
    expect(collectorRecipes[0].title).toBe("Publieke curry");
  });
});
