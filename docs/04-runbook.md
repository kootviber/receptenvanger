# 04 - Runbook

## Lokaal starten
1. Installeer dependencies met `npm install`.
2. Kopieer `.env.example` naar `.env`.
3. Vul minimaal `OPENAI_API_KEY`, `OPENAI_MODEL`, `PORT` en `DATABASE_PATH` in.
4. Bouw alles met `npm run build`.
5. Start de API met `npm run start:api`.
6. Laad desgewenst de extension uit `dist/` als unpacked extension in Chrome of Edge.
7. Na elke codewijziging: opnieuw `npm run build`, dan `Reload` op de extension en herlaad de webpagina.

## Quick smoke test
1. `GET /health`
2. `POST /api/users`
3. `POST /api/recipes/import-json`
4. `GET /api/users/:userId/books`
5. `POST /api/users/:userId/books/:bookId/recipes` voor een publiek recept
6. `GET /api/users/:userId/recipes`
7. `GET /api/recipes/public`
8. Extension handmatig testen op een echte receptpagina, bijvoorbeeld `https://miljuschka.nl/crispy-zalm-bowl/`

## Extension smoke test
1. Open een normale `https://` receptpagina.
2. Controleer dat je niet op een browser-interne pagina zit zoals `edge://extensions`.
3. Open de popup.
4. Klik `Vang recept van huidige pagina`.
5. Controleer dat JSON verschijnt.
6. Test `Kopieer` en `Download`.

## Troubleshooting extension
- `Could not establish connection. Receiving end does not exist.`:
  herlaad de webpagina of reload de unpacked extension. Het content script zit dan meestal niet in de huidige tab.
- OpenAI `invalid_json_schema`:
  gebruik de nieuwste build; oudere builds bevatten nog een incompatibel `recipe_document` schema voor de Responses API.
- Popup te smal:
  gebruik een recente build; de popupbreedte is vergroot in de laatste versie.

## Voorbeeld smoke cURL
```bash
curl http://127.0.0.1:8787/health
```

```bash
curl -X POST http://127.0.0.1:8787/api/users \
  -H 'Content-Type: application/json' \
  --data '{"display_name":"Demo gebruiker"}'
```

## Deploy
- Voor nu alleen lokaal gebruik.
- Extension wordt als unpacked build geladen.
- API draait als lokaal Node-proces.

## Rollback
- Bewaar altijd de laatste werkende git-state en build.
- Bij regressie: laad eerdere `dist/` en `server-dist/` opnieuw en herstel eventueel het vorige SQLite-bestand.

## Migraties
- SQLite-schema wordt nu via `CREATE TABLE IF NOT EXISTS` plus eenvoudige kolom-migraties opgebouwd.
- Contractwijzigingen aan `recipe_document`, users of recipe books moeten expliciet worden gedocumenteerd.

## Incidentresponse
1. Controleer of `OPENAI_API_KEY` is gezet voor de API of Options voor de extension.
2. Controleer `GET /health`.
3. Controleer of de user/book-route de juiste `userId` gebruikt.
4. Controleer of een recept `public` is voordat een tweede gebruiker het probeert op te slaan.
5. Leg structurele issues vast in `docs/06-known-issues/`.

## Logging
- Houd logging minimaal en log nooit secrets.
- Log geen volledige screenshots of grote bronpayloads in standaarduitvoer.

## Secrets
- Extension-key alleen lokaal in `chrome.storage.local`.
- API-key alleen via `.env` of procesomgeving.
- Geen keys uit andere projecten overnemen.

## Health checks
- `npm run typecheck`
- `npm test`
- `npm run build`
- `GET /health`
- `POST /api/recipes/import-json`
- `POST /api/users`
- `POST /api/users/:userId/books/:bookId/recipes` voor een publiek recept

## Veelvoorkomende storingen
- Geen API key ingesteld
- OpenAI rate limit of ongeldige key
- URL geeft geen HTML terug
- Screenshot bevat te weinig bruikbare tekst
- Private recepten van andere users worden ten onrechte aangeboden

Leg elk incident vast in `docs/06-known-issues/`.
