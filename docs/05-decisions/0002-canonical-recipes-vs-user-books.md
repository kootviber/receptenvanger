# ADR 0002 - Canonical Recipes Versus User Books

## Status
Geaccepteerd

## Context
Gebruikers moeten straks zowel eigen recepten kunnen beheren als publieke recepten kunnen opslaan in een persoonlijk receptenboek, inclusief eigen ratings, notities en tags.

## Beslissing
We scheiden:
- canonieke recepten in `recipes`
- persoonlijke boeken in `recipe_books`
- user-specifieke opslag en metadata in `recipe_book_entries`

## Alternatieven
- Alles direct op het receptrecord opslaan
- Voor elke gebruiker een volledige kopie van elk opgeslagen recept maken

## Gevolgen
- Publieke recepten kunnen hergebruikt worden zonder bronduplicatie
- User-specifieke metadata overschrijft het basisrecept niet
- Queries worden iets complexer
- Echte auth en autorisatie worden later belangrijker
