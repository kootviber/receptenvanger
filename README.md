# Receptenvanger

`receptenvanger` bestaat nu uit twee delen:
- een Chrome extension MVP die recepten van websites omzet naar een herbruikbaar `recipe_document`
- een lokale Node API die recepten in SQLite opslaat en ook user books en publieke recepten ondersteunt

## Huidige status
Status per 10 maart 2026:
- extension MVP werkt lokaal
- lokale API werkt lokaal
- user books en publieke recepten werken
- `import-json` is handmatig end-to-end gevalideerd
- `import-url` en `import-image` zijn technisch aanwezig, maar nog niet live gevalideerd met een echte OpenAI key in deze repo-sessie

## Wat er nu werkt
- Chrome extension op Manifest V3
- OpenAI-gestuurde omzetting van pagina-inhoud naar gestructureerde recept-JSON
- lokale API met opslag in SQLite
- import via JSON, URL of screenshot/image
- users, recipe books en publieke recepten
- een gebruiker kan publieke recepten opslaan in het eigen receptenboek

## Belangrijke grenzen
- ik heb geen API key uit andere projecten gebruikt of uitgelezen
- de extension bewaart zijn key lokaal in `chrome.storage.local`
- de lokale API verwacht een eigen `OPENAI_API_KEY` in `.env`
- Ollama is nog niet aangesloten
- `node:sqlite` is nog experimenteel in Node 24; zie [known issue](docs/06-known-issues/0001-node-sqlite-experimental.md)

## Systeem in één beeld
- Extension ingestie: [src/content.ts](src/content.ts) en [src/lib/page-capture.ts](src/lib/page-capture.ts)
- Extension AI-call: [src/background.ts](src/background.ts) en [src/lib/openai.ts](src/lib/openai.ts)
- Lokale API: [src/api/server.ts](src/api/server.ts)
- Database en repository: [src/api/database.ts](src/api/database.ts) en [src/api/repository.ts](src/api/repository.ts)
- Gedeeld contract: [src/lib/recipe-schema.ts](src/lib/recipe-schema.ts)

## JSON-vorm
De kern blijft een `recipe_document` met:
- `source`
- `recipe`
- `extraction`

Zie [recipe-document-envelope.md](docs/07-reuse-patterns/recipe-document-envelope.md).

## Installeren
```bash
cd /opt/projects/receptenvanger
npm install
cp .env.example .env
```

## Extension bouwen en laden
```bash
npm run build
```

1. Open Chrome op `chrome://extensions`.
2. Zet `Developer mode` aan.
3. Kies `Load unpacked`.
4. Selecteer `dist/`.
5. Open daarna de extension en vul in `Options` je eigen OpenAI key in.

## Lokale API starten
Zet in `.env` minimaal:

```bash
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4.1-mini
PORT=8787
DATABASE_PATH=./data/receptenvanger.sqlite
```

Start daarna:

```bash
npm run build
npm run start:api
```

De API luistert standaard op `http://127.0.0.1:8787`.

## API-routes
- `GET /health`
- `GET /api/recipes`
- `GET /api/recipes/public`
- `GET /api/recipes/:id`
- `POST /api/recipes/import-json`
- `POST /api/recipes/import-url`
- `POST /api/recipes/import-image`
- `POST /api/users`
- `GET /api/users/:userId/books`
- `POST /api/users/:userId/books`
- `GET /api/users/:userId/recipes`
- `POST /api/users/:userId/books/:bookId/recipes`

## Functioneel model
- `recipes`: canonieke receptrecords met `visibility` (`private` of `public`)
- `recipe_books`: persoonlijke boeken per user
- `recipe_book_entries`: de relatie tussen user/book en recipe, inclusief eigen rating, notities en extra tags

Daarmee kun je nu:
- alleen je eigen recepten zien
- publieke recepten bewaren in je eigen receptenboek
- persoonlijke metadata toevoegen zonder het bronrecept te overschrijven

## Aanbevolen smoke flow voor een nieuwe sessie
1. `npm install`
2. `cp .env.example .env` en vul `OPENAI_API_KEY`
3. `npm run typecheck && npm test && npm run build`
4. `npm run start:api`
5. `POST /api/users`
6. `POST /api/recipes/import-json`
7. `GET /api/recipes/public` of `GET /api/users/:userId/recipes`

## Scripts
- `npm run typecheck`
- `npm test`
- `npm run build`
- `npm run start:api`

## Verificatie
- `npm run typecheck`
- `npm test`
- `npm run build`
- handmatig geverifieerd:
  - `GET /health`
  - `POST /api/recipes/import-json`
  - `GET /api/recipes`
  - user aanmaken
  - publiek recept importeren
  - publiek recept opslaan in tweede gebruiker zijn receptenboek
  - `GET /api/users/:userId/recipes`
  - `GET /api/recipes/public`

## Volgende logische slice
- extension direct laten posten naar de lokale API
- echte auth en sessies toevoegen
- Ollama-provider naast OpenAI toevoegen
- image upload als multipart ondersteunen

## Documentatie
- [Overzicht](docs/00-overview.md)
- [Product](docs/01-product.md)
- [Architectuur](docs/02-architecture.md)
- [UI-systeem](docs/03-ui-system.md)
- [Runbook](docs/04-runbook.md)
- [ADR's](docs/05-decisions/README.md)
- [Known issues](docs/06-known-issues/README.md)
- [Reuse patterns](docs/07-reuse-patterns/README.md)
- [Definition of done](docs/08-definition-of-done.md)
