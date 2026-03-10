# 08 - Definition of Done

Een feature is pas klaar als alle onderstaande punten expliciet zijn afgevinkt.

## Functionaliteit
- [ ] Werkt volgens afgesproken acceptatiecriteria.
- [ ] Edge cases en foutscenario's zijn afgedekt.

## Tests
- [ ] Unit/integration tests bijgewerkt waar relevant.
- [ ] Kritieke flow heeft minimaal een smoke of e2e check.
- [ ] CI-gates slagen.
- [ ] Parsing- of validatieregressies zijn afgedekt wanneer importlogica is aangepast.

## Documentatie
- [ ] Relevante docs in `docs/` bijgewerkt.
- [ ] `CHANGELOG.md` bijgewerkt indien release-relevant.
- [ ] ADR toegevoegd bij architectuurkeuze met impact.

## UI en UX
- [ ] Loading, empty, error en success states aanwezig.
- [ ] Mobiele bruikbaarheid gecontroleerd.
- [ ] Toegankelijkheid basis (keyboard, labels, focus, contrast) gecontroleerd.

## Architectuur en operations
- [ ] Geen stille breaking change.
- [ ] Observability (logging/error tracking) aanwezig.
- [ ] Release- en rollback-impact beoordeeld.
