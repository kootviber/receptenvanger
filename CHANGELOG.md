# Changelog

Alle noemenswaardige wijzigingen in `receptenvanger` worden hier vastgelegd.

## [0.4.1] - 2026-03-10
### Gewijzigd
- Popup-layout van de extension verbreed zodat JSON in Edge/Chrome beter leesbaar is.
- `recipe_document` JSON-schema opgeschoond voor OpenAI Responses API compatibiliteit.
- `required` velden in het geserialiseerde schema genormaliseerd zodat OpenAI het schema accepteert.

### Gevalideerd
- Unpacked extension handmatig getest op `https://miljuschka.nl/crispy-zalm-bowl/`
- Responses API schema-call live gevalideerd met een echte OpenAI key

## [0.4.0] - 2026-03-10
### Toegevoegd
- Users, recipe books en book entries in de lokale API.
- Ondersteuning voor publieke recepten naast private user-owned recepten.
- Mogelijkheid voor een tweede gebruiker om een publiek recept in het eigen receptenboek op te slaan.
- API-routes voor users, books, publieke recepten en user-specifieke receptlijsten.
- Verdere documentatie voor sessie-overdracht, ADR's en operationele smoke tests.

## [0.3.0] - 2026-03-10
### Toegevoegd
- Lokale Node API voor receptimport en opslag in SQLite.
- Endpoints voor `import-json`, `import-url` en `import-image`.
- Database-opzet voor recepten, bronnen, ingredienten, stappen en user-annotaties.
- Server-side HTML capture voor URL-imports.
- Tests voor HTML-capture en repository-opslag.

## [0.2.0] - 2026-03-10
### Toegevoegd
- Eerste werkende Chrome extension MVP op Manifest V3.
- Pagina-extractie via content script met DOM- en JSON-LD-signalen.
- OpenAI Responses API integratie voor omzetting naar gestructureerde recept-JSON.
- Popup voor analyse, JSON-preview, kopiëren en downloaden.
- Options-pagina voor lokale OpenAI-configuratie.
- Tests voor JSON-LD-extractie en recipe document normalisatie.

## [0.1.0] - 2026-03-10
### Toegevoegd
- Eerste projectbootstrap voor `receptenvanger`.
- Projectspecifieke `README.md`, `AGENTS.md` en documentatiestructuur.
- CI/CD- en templatebestanden als basis voor verdere invulling.
