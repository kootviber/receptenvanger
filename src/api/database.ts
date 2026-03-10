import { mkdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

function ensureColumn(database: DatabaseSync, tableName: string, columnName: string, definition: string): void {
  const columns = database.prepare(`PRAGMA table_info(${tableName})`).all() as Array<{ name: string }>;
  const hasColumn = columns.some((column) => column.name === columnName);

  if (!hasColumn) {
    database.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
  }
}

export function openDatabase(databasePath: string): DatabaseSync {
  mkdirSync(path.dirname(databasePath), { recursive: true });

  const database = new DatabaseSync(databasePath);
  database.exec("PRAGMA foreign_keys = ON;");

  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      display_name TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS recipes (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      yield_text TEXT NOT NULL,
      servings INTEGER,
      prep_time_minutes INTEGER,
      cook_time_minutes INTEGER,
      total_time_minutes INTEGER,
      cuisine TEXT NOT NULL,
      course TEXT NOT NULL,
      owner_user_id TEXT,
      visibility TEXT NOT NULL DEFAULT 'private',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY(owner_user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS recipe_books (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      visibility TEXT NOT NULL DEFAULT 'private',
      is_default INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS recipe_book_entries (
      id TEXT PRIMARY KEY,
      recipe_book_id TEXT NOT NULL,
      recipe_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      rating INTEGER,
      notes TEXT NOT NULL,
      extra_tags_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(recipe_book_id, recipe_id),
      FOREIGN KEY(recipe_book_id) REFERENCES recipe_books(id) ON DELETE CASCADE,
      FOREIGN KEY(recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS recipe_sources (
      id TEXT PRIMARY KEY,
      recipe_id TEXT NOT NULL,
      source_type TEXT NOT NULL,
      source_url TEXT,
      canonical_url TEXT,
      page_title TEXT NOT NULL,
      site_name TEXT NOT NULL,
      language TEXT NOT NULL,
      captured_at TEXT NOT NULL,
      extraction_strategy TEXT NOT NULL,
      raw_capture_json TEXT,
      raw_document_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY(recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS recipe_ingredients (
      id TEXT PRIMARY KEY,
      recipe_id TEXT NOT NULL,
      sort_order INTEGER NOT NULL,
      section TEXT NOT NULL,
      name TEXT NOT NULL,
      quantity REAL,
      unit TEXT,
      quantity_text TEXT NOT NULL,
      preparation TEXT NOT NULL,
      notes TEXT NOT NULL,
      optional INTEGER NOT NULL,
      FOREIGN KEY(recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS recipe_steps (
      id TEXT PRIMARY KEY,
      recipe_id TEXT NOT NULL,
      sort_order INTEGER NOT NULL,
      section TEXT NOT NULL,
      title TEXT NOT NULL,
      instructions TEXT NOT NULL,
      duration_minutes INTEGER,
      FOREIGN KEY(recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS recipe_tags (
      recipe_id TEXT NOT NULL,
      tag TEXT NOT NULL,
      FOREIGN KEY(recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS recipe_diets (
      recipe_id TEXT NOT NULL,
      diet TEXT NOT NULL,
      FOREIGN KEY(recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS recipe_equipment (
      recipe_id TEXT NOT NULL,
      equipment TEXT NOT NULL,
      FOREIGN KEY(recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS recipe_tips (
      id TEXT PRIMARY KEY,
      recipe_id TEXT NOT NULL,
      sort_order INTEGER NOT NULL,
      tip TEXT NOT NULL,
      FOREIGN KEY(recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS recipe_user_annotations (
      id TEXT PRIMARY KEY,
      recipe_id TEXT NOT NULL,
      user_id TEXT,
      rating INTEGER,
      notes TEXT NOT NULL,
      extra_tags_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY(recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
    );
  `);

  ensureColumn(database, "recipes", "owner_user_id", "TEXT");
  ensureColumn(database, "recipes", "visibility", "TEXT NOT NULL DEFAULT 'private'");

  return database;
}
