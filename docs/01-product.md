# 01 - Product

## User journeys
1. Als gebruiker wil ik een recept van een website of screenshot importeren zodat het in mijn eigen systeem staat.
2. Als gebruiker wil ik alleen mijn eigen recepten en opgeslagen publieke recepten zien zodat mijn bibliotheek persoonlijk blijft.
3. Als gebruiker wil ik een publiek recept in mijn eigen receptenboek opslaan met eigen rating, notities en tags.
4. Als eigenaar wil ik een recept publiek kunnen maken zodat anderen het kunnen bewaren zonder mijn eigen versie te overschrijven.

## Schermen en flows
- Popup: toont key-status, handmatige notities, startknop en JSON-resultaat.
- Options: laat lokaal een OpenAI API key en model instellen voor de extension.
- Lokale API: accepteert imports, users, books en user-specifieke opslag.

## Business rules
- Het `recipe_document` is het centrale contract tussen import en opslag.
- Recepten hebben een `visibility`: `private` of `public`.
- Persoonlijke recipe-book entries bevatten user-specifieke metadata zoals rating, notities en extra tags.
- Publieke recepten mogen door andere gebruikers worden opgeslagen in een persoonlijk boek.

## Edge cases
- Lege data-set
- Timeouts of externe API-fouten
- Rechten/conflict situaties
- Gebruiker probeert een private recept van iemand anders op te slaan.
- Hetzelfde publieke recept wordt meerdere keren in hetzelfde boek opgeslagen.
- Screenshot is onscherp of deels afgesneden.

## Acceptatiecriteria
- [ ] Een gebruiker kan worden aangemaakt met een default receptenboek.
- [ ] Een publiek recept kan in een tweede gebruiker zijn receptenboek worden opgeslagen.
- [ ] Private recepten van andere gebruikers zijn niet via de book-entry route op te slaan.
- [ ] Persoonlijke metadata overschrijft het bronrecept niet.
