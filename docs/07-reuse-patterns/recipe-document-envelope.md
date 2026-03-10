# Recipe Document Envelope

## Doel
Dit patroon definieert een stabiel contract tussen bronextractie, AI-normalisatie en een latere recepten-API.

## Structuur
- `schema_version`: versie van het documentcontract
- `source`: metadata over de herkomst en capture
- `recipe`: het genormaliseerde recept
- `extraction`: kwaliteitssignalen en waarschuwingen

## Waarom dit patroon
- bronherkomst blijft traceerbaar
- AI-onzekerheid wordt expliciet in plaats van verstopt
- een latere API kan het document vrijwel 1-op-1 accepteren
- parsinglogica en opslaglogica blijven losgekoppeld

## Wanneer wel gebruiken
- browserextensie of importworker die recepten uit vrije broncontent haalt
- AI-normalisatie waarbij niet elk veld even zeker is
- pipelines waar bron en einddocument allebei relevant blijven

## Wanneer niet gebruiken
- eenvoudige handmatige invoer zonder bronverwijzing
- extreem klein systeem waar alleen titel plus ingrediënten nodig zijn

## Valkuilen
- te veel brondata in het document opnemen maakt het payload zwaar en lastig te beheren
- onzekere data toch als hard feit opslaan maakt latere correctie lastig
- contractwijzigingen zonder versionering breken downstream-verwerking

## Voorbeeldvelden
- `source.url`
- `source.extraction_strategy`
- `recipe.ingredients[].quantity_text`
- `recipe.steps[].instructions`
- `extraction.warnings`
- `extraction.missing_fields`
