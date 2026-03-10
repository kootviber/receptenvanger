import { describe, expect, it } from "vitest";
import { pickRecipeJsonLdCandidates } from "../src/lib/json-ld";

describe("pickRecipeJsonLdCandidates", () => {
  it("extracts recipe nodes from @graph payloads", () => {
    const nodes = pickRecipeJsonLdCandidates([
      {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "BreadcrumbList",
            name: "breadcrumbs"
          },
          {
            "@type": ["Recipe", "CreativeWork"],
            name: "Pasta"
          }
        ]
      }
    ]);

    expect(nodes).toHaveLength(1);
    expect(nodes[0]).toMatchObject({ name: "Pasta" });
  });

  it("accepts schema.org type values that contain Recipe", () => {
    const nodes = pickRecipeJsonLdCandidates([
      {
        "@type": "https://schema.org/Recipe",
        name: "Chili"
      }
    ]);

    expect(nodes).toHaveLength(1);
    expect(nodes[0]).toMatchObject({ name: "Chili" });
  });
});
