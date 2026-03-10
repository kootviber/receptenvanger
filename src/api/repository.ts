import { randomUUID } from "node:crypto";
import type { DatabaseSync } from "node:sqlite";
import type { PageCapture } from "../lib/page-capture";
import type { RecipeDocument } from "../lib/recipe-schema";
import type { UserAnnotationInput } from "./schemas";

type SaveRecipeOptions = {
  sourceType: "json" | "url" | "image";
  rawCapture?: PageCapture | Record<string, unknown>;
  annotations?: UserAnnotationInput;
  ownerUserId?: string;
  visibility?: "private" | "public";
};

function slugify(value: string): string {
  const base = value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return base || "recipe";
}

function hasAnnotationContent(annotation?: UserAnnotationInput): boolean {
  if (!annotation) {
    return false;
  }

  return Boolean(annotation.user_id || annotation.notes || annotation.extra_tags.length > 0 || annotation.rating != null);
}

export class RecipeRepository {
  public constructor(private readonly database: DatabaseSync) {}

  public createUser(displayName: string): { userId: string; defaultBookId: string } {
    const userId = randomUUID();
    const now = new Date().toISOString();

    this.database.exec("BEGIN");

    try {
      this.database.prepare(`INSERT INTO users (id, display_name, created_at) VALUES (?, ?, ?)`).run(userId, displayName, now);
      const defaultBookId = this.createBookInternal(userId, "Mijn recepten", "private", true, now);
      this.database.exec("COMMIT");
      return { userId, defaultBookId };
    } catch (error) {
      this.database.exec("ROLLBACK");
      throw error;
    }
  }

  public listUserBooks(userId: string): Array<{ id: string; name: string; visibility: string; is_default: number }> {
    return this.database
      .prepare(`SELECT id, name, visibility, is_default FROM recipe_books WHERE user_id = ? ORDER BY is_default DESC, created_at ASC`)
      .all(userId) as Array<{ id: string; name: string; visibility: string; is_default: number }>;
  }

  public createBook(userId: string, name: string, visibility: "private" | "public"): { bookId: string } {
    this.assertUserExists(userId);
    const bookId = this.createBookInternal(userId, name, visibility, false, new Date().toISOString());
    return { bookId };
  }

  public saveRecipeToBook(input: {
    userId: string;
    bookId: string;
    recipeId: string;
    rating?: number | null;
    notes: string;
    extraTags: string[];
  }): { entryId: string } {
    this.assertBookBelongsToUser(input.bookId, input.userId);

    const recipe = this.database
      .prepare(`SELECT owner_user_id, visibility FROM recipes WHERE id = ?`)
      .get(input.recipeId) as { owner_user_id: string | null; visibility: string } | undefined;

    if (!recipe) {
      throw new Error("Recipe niet gevonden.");
    }

    if (recipe.visibility !== "public" && recipe.owner_user_id !== input.userId) {
      throw new Error("Je kunt dit private recept niet in je receptenboek opslaan.");
    }

    const existing = this.database
      .prepare(`SELECT id FROM recipe_book_entries WHERE recipe_book_id = ? AND recipe_id = ?`)
      .get(input.bookId, input.recipeId) as { id: string } | undefined;

    const now = new Date().toISOString();

    if (existing) {
      this.database
        .prepare(
          `UPDATE recipe_book_entries
           SET rating = ?, notes = ?, extra_tags_json = ?, updated_at = ?
           WHERE id = ?`
        )
        .run(input.rating ?? null, input.notes, JSON.stringify(input.extraTags), now, existing.id);

      return { entryId: existing.id };
    }

    const entryId = randomUUID();
    this.database
      .prepare(
        `INSERT INTO recipe_book_entries (
          id, recipe_book_id, recipe_id, user_id, rating, notes, extra_tags_json, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(entryId, input.bookId, input.recipeId, input.userId, input.rating ?? null, input.notes, JSON.stringify(input.extraTags), now, now);

    return { entryId };
  }

  public saveRecipeDocument(document: RecipeDocument, options: SaveRecipeOptions): { recipeId: string } {
    const recipeId = randomUUID();
    const sourceId = randomUUID();
    const now = new Date().toISOString();
    const visibility = options.visibility ?? "private";

    this.database.exec("BEGIN");

    try {
      if (options.ownerUserId) {
        this.assertUserExists(options.ownerUserId);
      }

      this.database
        .prepare(
          `INSERT INTO recipes (
            id, slug, title, description, yield_text, servings, prep_time_minutes, cook_time_minutes, total_time_minutes,
            cuisine, course, owner_user_id, visibility, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          recipeId,
          slugify(document.recipe.title),
          document.recipe.title,
          document.recipe.description,
          document.recipe.yield_text,
          document.recipe.servings,
          document.recipe.prep_time_minutes,
          document.recipe.cook_time_minutes,
          document.recipe.total_time_minutes,
          document.recipe.cuisine,
          document.recipe.course,
          options.ownerUserId ?? null,
          visibility,
          now,
          now
        );

      this.database
        .prepare(
          `INSERT INTO recipe_sources (
            id, recipe_id, source_type, source_url, canonical_url, page_title, site_name, language, captured_at,
            extraction_strategy, raw_capture_json, raw_document_json, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          sourceId,
          recipeId,
          options.sourceType,
          document.source.url,
          document.source.canonical_url,
          document.source.page_title,
          document.source.site_name,
          document.source.language,
          document.source.captured_at,
          document.source.extraction_strategy,
          options.rawCapture ? JSON.stringify(options.rawCapture) : null,
          JSON.stringify(document),
          now
        );

      const ingredientStatement = this.database.prepare(
        `INSERT INTO recipe_ingredients (
          id, recipe_id, sort_order, section, name, quantity, unit, quantity_text, preparation, notes, optional
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      );

      document.recipe.ingredients.forEach((ingredient, index) => {
        ingredientStatement.run(
          randomUUID(),
          recipeId,
          index + 1,
          ingredient.section,
          ingredient.name,
          ingredient.quantity,
          ingredient.unit,
          ingredient.quantity_text,
          ingredient.preparation,
          ingredient.notes,
          ingredient.optional ? 1 : 0
        );
      });

      const stepStatement = this.database.prepare(
        `INSERT INTO recipe_steps (id, recipe_id, sort_order, section, title, instructions, duration_minutes)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      );

      document.recipe.steps.forEach((step, index) => {
        stepStatement.run(randomUUID(), recipeId, index + 1, step.section, step.title, step.instructions, step.duration_minutes);
      });

      const tagStatement = this.database.prepare(`INSERT INTO recipe_tags (recipe_id, tag) VALUES (?, ?)`);
      document.recipe.tags.forEach((tag) => {
        tagStatement.run(recipeId, tag);
      });

      const dietStatement = this.database.prepare(`INSERT INTO recipe_diets (recipe_id, diet) VALUES (?, ?)`);
      document.recipe.diet.forEach((diet) => {
        dietStatement.run(recipeId, diet);
      });

      const equipmentStatement = this.database.prepare(`INSERT INTO recipe_equipment (recipe_id, equipment) VALUES (?, ?)`);
      document.recipe.equipment.forEach((equipment) => {
        equipmentStatement.run(recipeId, equipment);
      });

      const tipStatement = this.database.prepare(`INSERT INTO recipe_tips (id, recipe_id, sort_order, tip) VALUES (?, ?, ?, ?)`);
      document.recipe.tips.forEach((tip, index) => {
        tipStatement.run(randomUUID(), recipeId, index + 1, tip);
      });

      if (options.ownerUserId) {
        const defaultBookId = this.getDefaultBookId(options.ownerUserId);
        this.saveRecipeToBook({
          userId: options.ownerUserId,
          bookId: defaultBookId,
          recipeId,
          rating: options.annotations?.rating ?? null,
          notes: options.annotations?.notes ?? "",
          extraTags: options.annotations?.extra_tags ?? []
        });
      } else if (hasAnnotationContent(options.annotations)) {
        this.database
          .prepare(
            `INSERT INTO recipe_user_annotations (
              id, recipe_id, user_id, rating, notes, extra_tags_json, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
          )
          .run(
            randomUUID(),
            recipeId,
            options.annotations?.user_id ?? null,
            options.annotations?.rating ?? null,
            options.annotations?.notes ?? "",
            JSON.stringify(options.annotations?.extra_tags ?? []),
            now,
            now
          );
      }

      this.database.exec("COMMIT");
      return { recipeId };
    } catch (error) {
      this.database.exec("ROLLBACK");
      throw error;
    }
  }

  public listRecipes(): Array<{ id: string; title: string; created_at: string; source_type: string; source_url: string | null; visibility: string }> {
    return this.database
      .prepare(
        `SELECT recipes.id, recipes.title, recipes.created_at, recipes.visibility, recipe_sources.source_type, recipe_sources.source_url
         FROM recipes
         JOIN recipe_sources ON recipe_sources.recipe_id = recipes.id
         ORDER BY recipes.created_at DESC`
      )
      .all() as Array<{ id: string; title: string; created_at: string; source_type: string; source_url: string | null; visibility: string }>;
  }

  public listPublicRecipes(): Array<{ id: string; title: string; created_at: string; source_url: string | null }> {
    return this.database
      .prepare(
        `SELECT recipes.id, recipes.title, recipes.created_at, recipe_sources.source_url
         FROM recipes
         JOIN recipe_sources ON recipe_sources.recipe_id = recipes.id
         WHERE recipes.visibility = 'public'
         ORDER BY recipes.created_at DESC`
      )
      .all() as Array<{ id: string; title: string; created_at: string; source_url: string | null }>;
  }

  public listRecipesForUser(userId: string): Array<Record<string, unknown>> {
    this.assertUserExists(userId);

    return this.database
      .prepare(
        `SELECT recipe_book_entries.id AS entry_id, recipe_books.id AS book_id, recipe_books.name AS book_name,
                recipes.id AS recipe_id, recipes.title, recipes.visibility, recipe_book_entries.rating,
                recipe_book_entries.notes, recipe_book_entries.extra_tags_json, recipe_sources.source_url
         FROM recipe_book_entries
         JOIN recipe_books ON recipe_books.id = recipe_book_entries.recipe_book_id
         JOIN recipes ON recipes.id = recipe_book_entries.recipe_id
         LEFT JOIN recipe_sources ON recipe_sources.recipe_id = recipes.id
         WHERE recipe_book_entries.user_id = ?
         ORDER BY recipe_book_entries.created_at DESC`
      )
      .all(userId) as Array<Record<string, unknown>>;
  }

  public getRecipe(recipeId: string): Record<string, unknown> | null {
    const recipe = this.database
      .prepare(
        `SELECT id, slug, title, description, yield_text, servings, prep_time_minutes, cook_time_minutes, total_time_minutes,
                cuisine, course, owner_user_id, visibility, created_at, updated_at
         FROM recipes WHERE id = ?`
      )
      .get(recipeId) as Record<string, unknown> | undefined;

    if (!recipe) {
      return null;
    }

    const source = this.database
      .prepare(
        `SELECT source_type, source_url, canonical_url, page_title, site_name, language, captured_at, extraction_strategy, raw_document_json
         FROM recipe_sources WHERE recipe_id = ? LIMIT 1`
      )
      .get(recipeId) as Record<string, unknown>;

    const ingredients = this.database
      .prepare(
        `SELECT sort_order, section, name, quantity, unit, quantity_text, preparation, notes, optional
         FROM recipe_ingredients WHERE recipe_id = ? ORDER BY sort_order ASC`
      )
      .all(recipeId) as Array<Record<string, unknown>>;

    const steps = this.database
      .prepare(
        `SELECT sort_order, section, title, instructions, duration_minutes
         FROM recipe_steps WHERE recipe_id = ? ORDER BY sort_order ASC`
      )
      .all(recipeId) as Array<Record<string, unknown>>;

    const tags = this.database.prepare(`SELECT tag FROM recipe_tags WHERE recipe_id = ? ORDER BY tag ASC`).all(recipeId) as Array<{ tag: string }>;

    const bookEntries = this.database
      .prepare(
        `SELECT recipe_books.id AS book_id, recipe_books.name AS book_name, recipe_book_entries.user_id,
                recipe_book_entries.rating, recipe_book_entries.notes, recipe_book_entries.extra_tags_json
         FROM recipe_book_entries
         JOIN recipe_books ON recipe_books.id = recipe_book_entries.recipe_book_id
         WHERE recipe_book_entries.recipe_id = ?`
      )
      .all(recipeId) as Array<Record<string, unknown>>;

    const annotations = this.database
      .prepare(
        `SELECT user_id, rating, notes, extra_tags_json, created_at, updated_at
         FROM recipe_user_annotations WHERE recipe_id = ? ORDER BY created_at DESC`
      )
      .all(recipeId) as Array<Record<string, unknown>>;

    return {
      recipe,
      source,
      ingredients,
      steps,
      tags: tags.map((row) => row.tag),
      annotations,
      book_entries: bookEntries
    };
  }

  private createBookInternal(
    userId: string,
    name: string,
    visibility: "private" | "public",
    isDefault: boolean,
    createdAt: string
  ): string {
    const bookId = randomUUID();
    this.database
      .prepare(
        `INSERT INTO recipe_books (id, user_id, name, visibility, is_default, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .run(bookId, userId, name, visibility, isDefault ? 1 : 0, createdAt);

    return bookId;
  }

  private getDefaultBookId(userId: string): string {
    const existing = this.database
      .prepare(`SELECT id FROM recipe_books WHERE user_id = ? AND is_default = 1 LIMIT 1`)
      .get(userId) as { id: string } | undefined;

    if (existing) {
      return existing.id;
    }

    return this.createBookInternal(userId, "Mijn recepten", "private", true, new Date().toISOString());
  }

  private assertUserExists(userId: string): void {
    const existing = this.database.prepare(`SELECT id FROM users WHERE id = ?`).get(userId) as { id: string } | undefined;
    if (!existing) {
      throw new Error("User niet gevonden.");
    }
  }

  private assertBookBelongsToUser(bookId: string, userId: string): void {
    const existing = this.database
      .prepare(`SELECT id FROM recipe_books WHERE id = ? AND user_id = ?`)
      .get(bookId, userId) as { id: string } | undefined;

    if (!existing) {
      throw new Error("Receptenboek niet gevonden voor deze gebruiker.");
    }
  }
}
