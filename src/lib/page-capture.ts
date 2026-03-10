import { parseJsonLdBlocks, pickRecipeJsonLdCandidates } from "./json-ld";

export type PageHeading = {
  level: number;
  text: string;
};

export type PageSection = {
  heading: string;
  content: string;
};

export type PageCapture = {
  sourceUrl: string;
  canonicalUrl: string | null;
  pageTitle: string;
  siteName: string;
  description: string;
  language: string;
  capturedAt: string;
  headings: PageHeading[];
  sectionSnippets: PageSection[];
  listItems: string[];
  visibleText: string;
  recipeJsonLd: unknown[];
};

function cleanText(value: string | null | undefined): string {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function clipText(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1)}…`;
}

function readMeta(...selectors: string[]): string {
  for (const selector of selectors) {
    const element = document.querySelector<HTMLMetaElement>(selector);
    const content = cleanText(element?.content);
    if (content) {
      return content;
    }
  }

  return "";
}

function collectHeadings(): PageHeading[] {
  return Array.from(document.querySelectorAll<HTMLHeadingElement>("h1, h2, h3, h4"))
    .map((element) => ({
      level: Number.parseInt(element.tagName.slice(1), 10),
      text: cleanText(element.innerText)
    }))
    .filter((heading) => heading.text.length > 0)
    .slice(0, 30);
}

function collectListItems(): string[] {
  return Array.from(document.querySelectorAll<HTMLLIElement>("li"))
    .map((element) => cleanText(element.innerText))
    .filter((text) => text.length > 0)
    .slice(0, 80);
}

function isRelevantHeading(text: string): boolean {
  return /ingredient|ingredi[eë]nt|instruction|bereiding|stap|methode|recipe|recept/i.test(text);
}

function collectSectionSnippets(): PageSection[] {
  const headings = Array.from(document.querySelectorAll<HTMLHeadingElement>("h1, h2, h3"));
  const sections: PageSection[] = [];

  for (const heading of headings) {
    const headingText = cleanText(heading.innerText);
    if (!headingText || !isRelevantHeading(headingText)) {
      continue;
    }

    const chunkParts: string[] = [];
    let sibling = heading.nextElementSibling;

    while (sibling && !/^H[1-3]$/.test(sibling.tagName) && chunkParts.join(" ").length < 1500) {
      const text = cleanText((sibling as HTMLElement).innerText);
      if (text) {
        chunkParts.push(text);
      }
      sibling = sibling.nextElementSibling;
    }

    if (chunkParts.length > 0) {
      sections.push({
        heading: headingText,
        content: clipText(chunkParts.join("\n"), 1500)
      });
    }
  }

  return sections.slice(0, 12);
}

function collectRecipeJsonLd(): unknown[] {
  const rawBlocks = Array.from(document.querySelectorAll<HTMLScriptElement>('script[type="application/ld+json"]'))
    .map((script) => script.textContent ?? "")
    .filter((value) => value.trim().length > 0);

  return pickRecipeJsonLdCandidates(parseJsonLdBlocks(rawBlocks)).slice(0, 6);
}

export function captureCurrentPage(): PageCapture {
  const visibleText = clipText(cleanText(document.body?.innerText ?? ""), 20000);

  return {
    sourceUrl: window.location.href,
    canonicalUrl: document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href ?? null,
    pageTitle: cleanText(document.title) || "Onbekende pagina",
    siteName: readMeta('meta[property="og:site_name"]', 'meta[name="application-name"]'),
    description: readMeta('meta[name="description"]', 'meta[property="og:description"]'),
    language: cleanText(document.documentElement.lang) || "unknown",
    capturedAt: new Date().toISOString(),
    headings: collectHeadings(),
    sectionSnippets: collectSectionSnippets(),
    listItems: collectListItems(),
    visibleText,
    recipeJsonLd: collectRecipeJsonLd()
  };
}
