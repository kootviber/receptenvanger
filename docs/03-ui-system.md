# 03 - UI-systeem

## Doel
Een compacte extension-UI waarmee de gebruiker in enkele seconden van "ik zit op een receptpagina" naar "ik heb bruikbare JSON" gaat.

## Design tokens
- Kleuren: warm en culinair, met een duidelijke accentkleur voor de hoofdactie.
- Typografie: functioneel en compact; focus op leesbaarheid van JSON en statussen.
- Radius/schaduw: zachte kaarten voor een rustige popup in klein viewport.

## Spacingregels
- Gebruik een vaste schaal zoals 4, 8, 12, 16 en 24.
- Houd popup-controls compact, maar laat voldoende ruimte voor fout- en statusmeldingen.

## Heading-hierarchie
- Popup en options hebben precies één `h1`.
- Resultaatblok gebruikt een `h2`.

## Button-hierarchie
- Primair: analyse starten.
- Secundair: options openen, JSON kopiëren of downloaden.
- Destructief: alleen voor key verwijderen in options.

## Formulierregels
- Labels altijd zichtbaar.
- Handmatige notities zijn optioneel en taakgericht geformuleerd.
- Foutmeldingen en statussen blijven dicht bij de actie zichtbaar.

## Lijst- en kaartregels
- JSON-output staat in één duidelijke result card.
- Statusmeldingen zijn kort en concreet.
- Geen visuele overbelasting; de extensie moet op kleine breedtes bruikbaar blijven.

## State coverage
Elke flow dekt minimaal:
- Idle
- Loading
- Error
- Success

## Responsive regels
- Popup werkt vanaf circa 380px breed.
- Options blijven bruikbaar op small desktop en smalle laptopbreedtes.

## Copy en toon
- Kort, direct en taakgericht.
- Foutmeldingen beschrijven wat ontbreekt en wat de gebruiker moet doen.
- Vermijd model- of promptjargon in standaardteksten.

## Standaard page patterns
- Popup voor analyse
- Options voor lokale configuratie
