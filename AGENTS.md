# AGENTS.md

## Missie
Deze repo bouwt `receptenvanger`: een kleine, betrouwbare app om recepten uit links, vrije tekst en handmatige invoer te verzamelen, op te schonen en doorzoekbaar te bewaren.

## Non-negotiables
- Type hints of typesafety zijn verplicht in applicatiecode.
- Invoer van gebruikers of externe sites wordt altijd gevalideerd aan de rand van het systeem.
- Geen secrets in code, fixtures, screenshots of logs.
- Elke wijziging met functionele impact werkt `README.md`, relevante `docs/` en waar nodig `CHANGELOG.md` bij.
- Nieuwe dependencies vereisen een korte motivatie in docs of PR-notitie.
- Basisflows moeten mobiel bruikbaar zijn.

## Architectuurregels
- Houd ingestie, domeinlogica en presentatie gescheiden.
- Parsers of scrapers zijn vervangbaar en hangen niet direct aan UI-code.
- Sla ruwe brondata en genormaliseerde receptdata apart op als beide nodig zijn.
- Start met een eenvoudige monolithische opzet; jobs of queueing alleen toevoegen bij echte noodzaak.
- Leg architectuurwijzigingen vast in `docs/05-decisions/`.

## UI-regels
- Kernflows eerst: recept toevoegen, recept bekijken, zoeken/filteren, bewerken.
- Formulieren tonen directe validatie en concrete foutmeldingen.
- Elke pagina heeft loading, empty, error en success feedback waar relevant.
- Mobiel eerst; receptkaarten en detailpagina's moeten goed scanbaar blijven op kleine schermen.
- Destructieve acties vereisen expliciete bevestiging.

## Data- en validatieregels
- Normaliseer receptvelden expliciet: titel, bron, ingredienten, stappen, tags en tijden.
- Bewaak herkomst per recept via `source_url`, `source_type` of vergelijkbaar veld.
- Voer deduplicatie uit op een verklaarbare manier; geen stille merges zonder trace.
- Datumvelden en statussen krijgen consistente naming.
- Schemazwijzigingen en migraties worden gedocumenteerd.

## Quality rules
- Minimale baseline: lint, typecheck, tests en build moeten kunnen worden toegevoegd en groen draaien.
- Nieuwe parsing- of importlogica krijgt tests op happy path en foutpaden.
- Regressies rond validatie, deduplicatie en bronverwerking krijgen prioriteit in tests.
- Logging en foutafhandeling worden vanaf de eerste werkende slice meegenomen.

## Delivery rules
- Werk in kleine verticale slices met zichtbaar gebruikersresultaat.
- Beschrijf per wijziging scope, risico, testimpact en operationele impact.
- Geen rode CI naar `main`.
- Gebruik feature flags of afgeschermde routes voor risicovolle experimentele flows.

## Documentatieregels
- Update minimaal `README.md`, relevante `docs/*` en `CHANGELOG.md` bij betekenisvolle wijzigingen.
- Leg bekende problemen vast in `docs/06-known-issues/`.
- Leg herbruikbare import-, parsing- of UX-patronen vast in `docs/07-reuse-patterns/`.

## Dependencies
- Kies libraries die parsing, validatie of developer-snelheid aantoonbaar verbeteren.
- Vermijd overlap tussen meerdere state-, form- of scraping-oplossingen zonder duidelijke reden.
- Verwijder ongebruikte dependencies actief.

## Migraties en breaking changes
- Documenteer impact, migratiepad en rollback bij breaking changes.
- Test migraties eerst op kopie of preview-omgeving zodra er persistente data is.
- Voer geen stille veldhernoemingen of dataverlies-migraties door.

## Definition of done
Een taak is pas af als gedrag, tests, docs, operationele impact en relevante UI-states expliciet zijn beoordeeld.
