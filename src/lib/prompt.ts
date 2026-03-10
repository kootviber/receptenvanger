import type { PageCapture } from "./page-capture";

export const SYSTEM_PROMPT = `Je zet webpagina-inhoud om naar herbruikbare recept-JSON.

Regels:
- Gebruik alleen informatie uit de aangeleverde pagina-capture en handmatige notities.
- Verzin geen ingredienten, hoeveelheden, tijden of stappen.
- Als iets onzeker is, zet het in warnings of missing_fields.
- Gebruik extraction_strategy "json_ld" als de kern uit recipe JSON-LD komt, "dom" als het vooral uit zichtbare content komt, "hybrid" als beide nodig zijn, en "manual" als notities leidend zijn.
- Als er geen betrouwbare bron-URL is, mag source.url null zijn.
- Gebruik null voor onbekende numerieke velden.
- Houd instructions compact maar compleet.
- Quantity_text mag het ruwe maatdeel bewaren als exact numeriek ontleden lastig is.
- Gebruik korte, consistente tags.
`;

export function buildUserPrompt(capture: PageCapture, manualNotes: string): string {
  return JSON.stringify(
    {
      task: "Maak een recipe_document volgens het meegeleverde schema.",
      manual_notes: manualNotes.trim(),
      capture
    },
    null,
    2
  );
}
