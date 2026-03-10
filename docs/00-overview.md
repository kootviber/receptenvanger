# 00 - Projectoverzicht

## Doel
`receptenvanger` helpt gebruikers recepten van websites en screenshots om te zetten naar een consistent JSON-document, lokaal op te slaan en later in een persoonlijk receptenboek te beheren. Het systeem ondersteunt daarnaast publieke recepten die andere gebruikers in hun eigen boek kunnen opslaan zonder het bronrecept te muteren.

## Doelgroep
- Primaire gebruikers: mensen die online recepten willen bewaren in een eigen structuur.
- Secundaire gebruikers: makers van een receptendatabase of persoonlijke kookapp die brondata willen normaliseren.
- Interne stakeholders: ontwikkelaar, product-owner en later de beheerder van auth en synchronisatie.

## Scope
### In scope
- Chrome extension MVP voor huidige tab.
- Lokale API met SQLite-opslag.
- Import van `recipe_document`, URL en image/screenshot.
- Users, recipe books en publieke recepten.

### Buiten scope
- Volledige auth met sessies of federatie.
- Ollama-integratie in deze slice.
- Cloud-hosting of productie-uitrol.

## Kernflows
1. Een gebruiker importeert een recept via extension of API.
2. Het recept wordt private of public opgeslagen.
3. Een gebruiker ziet eigen recepten in zijn boeken en kan publieke recepten in het eigen boek bewaren.

## Niet-doen / grenzen
- Geen scope-uitbreiding zonder impactanalyse op planning en kwaliteit.
- Geen opslag van secrets in code, repo of logs.
- Geen uitlezen van API keys uit andere projecten.

## Succescriteria
- Een gebruiker kan alleen zijn eigen private recepten zien via de user-routes.
- Publieke recepten kunnen door andere gebruikers worden opgeslagen zonder duplicatie van het conceptuele bronrecept.
- Persoonlijke ratings, notities en tags blijven losgekoppeld van het canonieke recept.
