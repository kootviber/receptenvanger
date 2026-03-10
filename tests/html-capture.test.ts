import { describe, expect, it } from "vitest";
import { capturePageFromHtml } from "../src/api/html-capture";

describe("capturePageFromHtml", () => {
  it("extracts headings and recipe json-ld from html", () => {
    const capture = capturePageFromHtml(
      "https://example.com/recipe",
      `
        <html lang="nl">
          <head>
            <title>Tomatensoep</title>
            <meta property="og:site_name" content="Example Recipes" />
            <script type="application/ld+json">
              {"@context":"https://schema.org","@type":"Recipe","name":"Tomatensoep"}
            </script>
          </head>
          <body>
            <h1>Tomatensoep</h1>
            <h2>Ingredienten</h2>
            <ul><li>4 tomaten</li></ul>
            <h2>Bereiding</h2>
            <p>Kook alles samen.</p>
          </body>
        </html>
      `
    );

    expect(capture.pageTitle).toBe("Tomatensoep");
    expect(capture.recipeJsonLd).toHaveLength(1);
    expect(capture.listItems).toContain("4 tomaten");
  });
});
