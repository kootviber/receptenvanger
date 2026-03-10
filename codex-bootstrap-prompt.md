# Codex kickoff prompt voor `receptenvanger`

Gebruik deze prompt wanneer je de eerste echte applicatieslice in deze repo wilt bouwen.

```md
Je werkt in de repo `receptenvanger`.

Doel:
Bouw de eerstvolgende verticale slice voor een kleine recepten-app waarmee een gebruiker een recept kan toevoegen, bekijken en later terugvinden.

Belangrijke context:
- Lees eerst `AGENTS.md`.
- Gebruik `README.md` en `docs/00-overview.md` t/m `docs/04-runbook.md` als bron van waarheid.
- Houd ingestie, domeinlogica en presentatie gescheiden.
- Werk in kleine, complete stappen inclusief tests en docs-updates.

Voorkeursvolgorde:
1. Bevestig de gekozen stack of stel een minimale stack voor.
2. Bouw de add-flow voor URL, tekst of handmatige invoer.
3. Sla brondata en genormaliseerde receptdata op.
4. Voeg een eenvoudige detail- en overzichtsweergave toe.
5. Voeg tests toe voor validatie en parsing.
6. Werk `README.md`, `CHANGELOG.md` en relevante `docs/` bij.

Niet doen:
- Geen overbodige abstracties of microservices.
- Geen nieuwe dependency zonder korte motivatie.
- Geen ongedocumenteerde breaking changes.

Definition of done:
- Werkende verticale slice
- Relevante tests
- Duidelijke foutafhandeling
- Docs bijgewerkt
```
