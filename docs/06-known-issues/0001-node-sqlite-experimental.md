# Node SQLite Experimental

## Symptoom
Tijdens tests of serverstart verschijnt een waarschuwing dat `node:sqlite` nog experimenteel is.

## Oorzaak
De lokale API gebruikt de ingebouwde SQLite-module uit Node 24. Die werkt functioneel, maar Node markeert deze module nog als experimental.

## Oplossing
- Waarschuwing accepteren voor lokale MVP-ontwikkeling.
- Houd rekening met een mogelijke overstap naar `better-sqlite3` of een andere stabiele SQLite-driver als dit in productie een risico wordt.

## Preventie
- Leg deze afhankelijkheid expliciet vast in docs en ADR's.
- Houd de opslaglaag gecentraliseerd in `src/api/repository.ts` en `src/api/database.ts`, zodat een driverwissel beheersbaar blijft.

## Tags
- sqlite
- node24
- mvp
