# ADR 0001 - Extension Plus Local API First

## Status
Geaccepteerd

## Context
Het project moest snel een werkende MVP krijgen voor receptimport uit webpagina's en screenshots, zonder direct een productieklare backend of cloudomgeving te hoeven ontwerpen.

## Beslissing
We starten met twee lokale onderdelen:
- een Chrome extension voor browser-side capture
- een lokale Node API voor opslag, URL-imports en latere clientintegraties

## Alternatieven
- Alleen extension zonder API
- Meteen een volledige remote backend
- Alleen een backend zonder browserextensie

## Gevolgen
- Snelle iteratie lokaal
- Duidelijke scheiding tussen capture en persistence
- Tijdelijke dubbeling van ingestiepad: browser-side en server-side
- Later nog een stap nodig voor echte auth, deployment en provider-abstractie
