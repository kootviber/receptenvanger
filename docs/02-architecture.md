# 02 - Architectuur

## Overzicht
De oplossing bestaat uit een Chrome extension op Manifest V3 en een lokale Node API. De API beheert zowel het canonieke receptmodel als de user/book-laag daarboven.

## Lagen en verantwoordelijkheden
- Presentatie: `src/popup.ts` en `src/options.ts`.
- Ingestie client-side: `src/content.ts` en `src/lib/page-capture.ts`.
- Ingestie server-side: `src/api/html-capture.ts`.
- Domein: `src/lib/recipe-schema.ts`, `src/lib/prompt.ts` en `src/lib/json-ld.ts`.
- Side effects client-side: `src/background.ts`, `src/lib/openai.ts`, `src/lib/storage.ts`.
- Side effects server-side: `src/api/server.ts`, `src/api/openai-imports.ts`, `src/api/repository.ts`, `src/api/database.ts`.

## Datastromen
- Extension-flow: actieve pagina -> page capture -> OpenAI -> `recipe_document`.
- JSON API-flow: client -> `import-json` -> validatie -> SQLite.
- URL API-flow: client -> `import-url` -> fetch HTML -> server capture -> OpenAI -> validatie -> SQLite.
- Image API-flow: client -> `import-image` -> OpenAI vision -> validatie -> SQLite.
- User-flow: gebruiker -> recipe book -> book entry -> persoonlijk overzicht.

## Huidige componentmap
- Extension popup: `src/popup.ts`
- Extension options: `src/options.ts`
- Extension content script: `src/content.ts`
- Extension background worker: `src/background.ts`
- API entrypoint: `src/api/server.ts`
- API request schemas: `src/api/schemas.ts`
- API persistence: `src/api/repository.ts`
- API DB bootstrap: `src/api/database.ts`

## API-contract op hoofdlijnen
- Imports:
  - `import-json`
  - `import-url`
  - `import-image`
- Recept lezen:
  - `GET /api/recipes`
  - `GET /api/recipes/public`
  - `GET /api/recipes/:id`
- Users en books:
  - `POST /api/users`
  - `GET/POST /api/users/:userId/books`
  - `GET /api/users/:userId/recipes`
  - `POST /api/users/:userId/books/:bookId/recipes`

## Integraties
- Externe API's: OpenAI Responses API.
- Authenticatieprovider: nog niet aanwezig.
- Storageprovider: SQLite via Node `node:sqlite`.

## Auth-model
- Extension: lokale key in `chrome.storage.local`.
- API: `OPENAI_API_KEY` en model via environment.
- Users bestaan al in het datamodel, maar echte authenticatie ontbreekt nog.

## Storage
- `recipes`: canonieke recepten met owner en visibility.
- `recipe_books`: persoonlijke boeken per user.
- `recipe_book_entries`: user-specifieke relatie met rating, notes en extra tags.
- Overige tabellen: bronnen, ingredienten, stappen, tags, diets, equipment, tips.

## Belangrijke architectuurbeslissingen
- Canonieke recepten en persoonlijke boekmetadata zijn gescheiden.
- Extension en API delen hetzelfde `recipe_document` contract.
- URL-import gebruikt server-side HTML capture; de extension gebruikt browser-side page capture.
- Provider-abstrahering voor OpenAI/Ollama bestaat nog niet; OpenAI is nu direct geïntegreerd.

## Background jobs
- Huidig: on-demand request per API-call of popup-actie.
- Later: queueing of retry pas toevoegen bij echte noodzaak.

## Observability
- Loggingstrategie: minimaal; geen secrets en geen volledige bronpayloads in logs.
- Error tracking: nog niet aanwezig.
- Metrics en alerts: nog niet aanwezig.

## Deployment
- Extension: `dist/` als unpacked load.
- API: `server-dist/api.cjs` lokaal starten met `.env`.
- Databasebestand standaard onder `data/receptenvanger.sqlite`.

## Security basisregels
- Secrets alleen via lokale extension-opslag of `.env` voor de lokale API.
- Input-validatie aan elke trust boundary.
- Externe broncontent wordt behandeld als onbetrouwbare input.
- Private recepten van andere users mogen niet via recipe books worden gekoppeld.

## Standaard beslisregels
- Kies liever eenvoud dan abstractie.
- Voeg geen dependency toe zonder duidelijke winst.
- Houd het `recipe_document` stabiel en versioneer wijzigingen.
- Houd canonieke recepten en user-specifieke boekmetadata strikt gescheiden.
