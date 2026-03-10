import { createServer } from "node:http";
import { URL } from "node:url";
import { normalizeRecipeDocument } from "../lib/recipe-schema";
import { capturePageFromHtml } from "./html-capture";
import { HttpError, readJsonBody, sendJson } from "./http";
import { buildRecipeDocumentFromCapture, buildRecipeDocumentFromImage } from "./openai-imports";
import {
  createBookRequestSchema,
  createUserRequestSchema,
  importImageRequestSchema,
  importJsonRequestSchema,
  importUrlRequestSchema,
  saveRecipeToBookRequestSchema
} from "./schemas";
import { loadApiConfig } from "./config";
import { openDatabase } from "./database";
import { RecipeRepository } from "./repository";

const config = loadApiConfig();
const database = openDatabase(config.databasePath);
const repository = new RecipeRepository(database);

function requireOpenAiKey(): void {
  if (!config.openAiApiKey) {
    throw new HttpError(500, "OPENAI_API_KEY ontbreekt in de serveromgeving.");
  }
}

async function fetchHtml(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "receptenvanger-local-api/0.2"
    }
  });

  if (!response.ok) {
    throw new HttpError(response.status, `URL kon niet worden opgehaald (${response.status}).`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("text/html")) {
    throw new HttpError(400, `URL gaf geen HTML terug maar '${contentType}'.`);
  }

  return response.text();
}

const server = createServer(async (request, response) => {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
  response.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");

  if (request.method === "OPTIONS") {
    response.writeHead(204);
    response.end();
    return;
  }

  const requestUrl = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);

  try {
    if (request.method === "GET" && requestUrl.pathname === "/health") {
      sendJson(response, 200, {
        ok: true,
        service: "receptenvanger-local-api",
        database_path: config.databasePath
      });
      return;
    }

    if (request.method === "GET" && requestUrl.pathname === "/api/recipes") {
      sendJson(response, 200, {
        ok: true,
        recipes: repository.listRecipes()
      });
      return;
    }

    if (request.method === "GET" && requestUrl.pathname === "/api/recipes/public") {
      sendJson(response, 200, {
        ok: true,
        recipes: repository.listPublicRecipes()
      });
      return;
    }

    if (request.method === "GET" && requestUrl.pathname.startsWith("/api/recipes/")) {
      const recipeId = requestUrl.pathname.replace("/api/recipes/", "");
      const recipe = repository.getRecipe(recipeId);
      if (!recipe) {
        throw new HttpError(404, "Recipe niet gevonden.");
      }

      sendJson(response, 200, { ok: true, recipe });
      return;
    }

    if (request.method === "POST" && requestUrl.pathname === "/api/users") {
      const body = createUserRequestSchema.parse(await readJsonBody(request));
      const result = repository.createUser(body.display_name);

      sendJson(response, 201, {
        ok: true,
        user_id: result.userId,
        default_book_id: result.defaultBookId
      });
      return;
    }

    const userBooksMatch = requestUrl.pathname.match(/^\/api\/users\/([^/]+)\/books$/);
    if (userBooksMatch && request.method === "GET") {
      sendJson(response, 200, {
        ok: true,
        books: repository.listUserBooks(userBooksMatch[1])
      });
      return;
    }

    if (userBooksMatch && request.method === "POST") {
      const body = createBookRequestSchema.parse(await readJsonBody(request));
      const result = repository.createBook(userBooksMatch[1], body.name, body.visibility);

      sendJson(response, 201, {
        ok: true,
        book_id: result.bookId
      });
      return;
    }

    const userRecipesMatch = requestUrl.pathname.match(/^\/api\/users\/([^/]+)\/recipes$/);
    if (userRecipesMatch && request.method === "GET") {
      sendJson(response, 200, {
        ok: true,
        recipes: repository.listRecipesForUser(userRecipesMatch[1])
      });
      return;
    }

    const saveToBookMatch = requestUrl.pathname.match(/^\/api\/users\/([^/]+)\/books\/([^/]+)\/recipes$/);
    if (saveToBookMatch && request.method === "POST") {
      const body = saveRecipeToBookRequestSchema.parse(await readJsonBody(request));
      const result = repository.saveRecipeToBook({
        userId: saveToBookMatch[1],
        bookId: saveToBookMatch[2],
        recipeId: body.recipe_id,
        rating: body.rating ?? null,
        notes: body.notes,
        extraTags: body.extra_tags
      });

      sendJson(response, 201, {
        ok: true,
        entry_id: result.entryId
      });
      return;
    }

    if (request.method === "POST" && requestUrl.pathname === "/api/recipes/import-json") {
      const body = importJsonRequestSchema.parse(await readJsonBody(request));
      const document = normalizeRecipeDocument(body.document);
      const result = repository.saveRecipeDocument(document, {
        sourceType: "json",
        rawCapture: body.raw_capture as Record<string, unknown> | undefined,
        annotations: body.annotations,
        ownerUserId: body.ownership?.owner_user_id,
        visibility: body.ownership?.visibility
      });

      sendJson(response, 201, {
        ok: true,
        recipe_id: result.recipeId,
        document
      });
      return;
    }

    if (request.method === "POST" && requestUrl.pathname === "/api/recipes/import-url") {
      requireOpenAiKey();
      const body = importUrlRequestSchema.parse(await readJsonBody(request));
      const html = await fetchHtml(body.url);
      const capture = capturePageFromHtml(body.url, html);
      const document = await buildRecipeDocumentFromCapture(capture, body.manual_notes, {
        apiKey: config.openAiApiKey,
        model: config.openAiModel
      });
      const result = repository.saveRecipeDocument(document, {
        sourceType: "url",
        rawCapture: capture,
        annotations: body.annotations,
        ownerUserId: body.ownership?.owner_user_id,
        visibility: body.ownership?.visibility
      });

      sendJson(response, 201, {
        ok: true,
        recipe_id: result.recipeId,
        document
      });
      return;
    }

    if (request.method === "POST" && requestUrl.pathname === "/api/recipes/import-image") {
      requireOpenAiKey();
      const body = importImageRequestSchema.parse(await readJsonBody(request));
      const document = await buildRecipeDocumentFromImage({
        imageBase64: body.image_base64,
        mimeType: body.mime_type,
        sourceUrl: body.source_url,
        manualNotes: body.manual_notes,
        settings: {
          apiKey: config.openAiApiKey,
          model: config.openAiModel
        }
      });
      const result = repository.saveRecipeDocument(document, {
        sourceType: "image",
        rawCapture: {
          source_url: body.source_url ?? null,
          mime_type: body.mime_type
        },
        annotations: body.annotations,
        ownerUserId: body.ownership?.owner_user_id,
        visibility: body.ownership?.visibility
      });

      sendJson(response, 201, {
        ok: true,
        recipe_id: result.recipeId,
        document
      });
      return;
    }

    throw new HttpError(404, "Route niet gevonden.");
  } catch (error) {
    if (error instanceof HttpError) {
      sendJson(response, error.statusCode, {
        ok: false,
        error: error.message
      });
      return;
    }

    if (error instanceof Error) {
      sendJson(response, 500, {
        ok: false,
        error: error.message
      });
      return;
    }

    sendJson(response, 500, {
      ok: false,
      error: "Onbekende serverfout."
    });
  }
});

server.listen(config.port, () => {
  console.log(`Receptenvanger local API luistert op http://127.0.0.1:${config.port}`);
});
