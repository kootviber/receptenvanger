import * as cheerio from "cheerio";
import type { PageCapture, PageHeading, PageSection } from "../lib/page-capture";
import { parseJsonLdBlocks, pickRecipeJsonLdCandidates } from "../lib/json-ld";

function cleanText(value: string | null | undefined): string {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function clipText(value: string, maxLength: number): string {
  return value.length <= maxLength ? value : `${value.slice(0, maxLength - 1)}…`;
}

function collectHeadings($: cheerio.CheerioAPI): PageHeading[] {
  return $("h1, h2, h3, h4")
    .toArray()
    .map((element) => {
      const tagName = element.tagName?.toLowerCase() ?? "h1";
      return {
        level: Number.parseInt(tagName.slice(1), 10),
        text: cleanText($(element).text())
      };
    })
    .filter((heading) => heading.text.length > 0)
    .slice(0, 30);
}

function collectListItems($: cheerio.CheerioAPI): string[] {
  return $("li")
    .toArray()
    .map((element) => cleanText($(element).text()))
    .filter((text) => text.length > 0)
    .slice(0, 80);
}

function isRelevantHeading(text: string): boolean {
  return /ingredient|ingredi[eë]nt|instruction|bereiding|stap|methode|recipe|recept/i.test(text);
}

function collectSectionSnippets($: cheerio.CheerioAPI): PageSection[] {
  const sections: PageSection[] = [];

  $("h1, h2, h3").each((_index, element) => {
    const headingText = cleanText($(element).text());
    if (!headingText || !isRelevantHeading(headingText)) {
      return;
    }

    const chunkParts: string[] = [];
    let sibling = $(element).next();

    while (sibling.length > 0 && !/^h[1-3]$/i.test(sibling.get(0)?.tagName ?? "") && chunkParts.join(" ").length < 1500) {
      const text = cleanText(sibling.text());
      if (text) {
        chunkParts.push(text);
      }
      sibling = sibling.next();
    }

    if (chunkParts.length > 0) {
      sections.push({
        heading: headingText,
        content: clipText(chunkParts.join("\n"), 1500)
      });
    }
  });

  return sections.slice(0, 12);
}

export function capturePageFromHtml(url: string, html: string): PageCapture {
  const $ = cheerio.load(html);
  const rawJsonLd = $('script[type="application/ld+json"]')
    .toArray()
    .map((element) => $(element).html() ?? "")
    .filter((value) => value.trim().length > 0);

  return {
    sourceUrl: url,
    canonicalUrl: $("link[rel='canonical']").attr("href") ?? null,
    pageTitle: cleanText($("title").first().text()) || "Onbekende pagina",
    siteName: cleanText($('meta[property="og:site_name"]').attr("content")) || cleanText($('meta[name="application-name"]').attr("content")),
    description:
      cleanText($('meta[name="description"]').attr("content")) || cleanText($('meta[property="og:description"]').attr("content")),
    language: cleanText($("html").attr("lang")) || "unknown",
    capturedAt: new Date().toISOString(),
    headings: collectHeadings($),
    sectionSnippets: collectSectionSnippets($),
    listItems: collectListItems($),
    visibleText: clipText(cleanText($("body").text()), 20000),
    recipeJsonLd: pickRecipeJsonLdCandidates(parseJsonLdBlocks(rawJsonLd)).slice(0, 6)
  };
}
