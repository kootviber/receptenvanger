# Canonical Recipes And User Books

## Doel
Dit patroon scheidt gedeelde receptdata van user-specifieke opslag en annotaties.

## Patroon
- `recipes` bevat het canonieke recept
- `recipe_books` groepeert recepten per gebruiker
- `recipe_book_entries` bewaart de persoonlijke relatie tot dat recept

## Wanneer wel gebruiken
- als meerdere gebruikers hetzelfde publieke recept moeten kunnen bewaren
- als persoonlijke ratings, notities of tags niet het bronrecept mogen vervuilen
- als je private en publieke recepten naast elkaar wilt ondersteunen

## Wanneer niet gebruiken
- single-user scripts zonder publiek/private logica
- systemen waar recepten nooit tussen gebruikers gedeeld worden

## Valkuilen
- user-specifieke metadata per ongeluk toch op `recipes` zetten
- private/public checks niet op de koppellaag afdwingen
- duplicaten toestaan binnen hetzelfde book zonder duidelijke reden

## Voorbeeldcode
- `src/api/repository.ts`
- `src/api/database.ts`
