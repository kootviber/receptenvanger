type JsonObject = Record<string, unknown>;

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [value];
}

function extractTypeNames(value: unknown): string[] {
  return asArray(value)
    .map((item) => (typeof item === "string" ? item : ""))
    .filter(Boolean);
}

function flattenNode(value: unknown): JsonObject[] {
  if (Array.isArray(value)) {
    return value.flatMap(flattenNode);
  }

  if (!isObject(value)) {
    return [];
  }

  const graphNodes = Array.isArray(value["@graph"]) ? value["@graph"].flatMap(flattenNode) : [];
  const currentNode = extractTypeNames(value["@type"]).length > 0 ? [value] : [];

  return [...currentNode, ...graphNodes];
}

export function parseJsonLdBlocks(rawBlocks: string[]): unknown[] {
  return rawBlocks.flatMap((rawBlock) => {
    try {
      return [JSON.parse(rawBlock)];
    } catch {
      return [];
    }
  });
}

export function pickRecipeJsonLdCandidates(blocks: unknown[]): JsonObject[] {
  return blocks
    .flatMap(flattenNode)
    .filter((node) => extractTypeNames(node["@type"]).some((typeName) => typeName.toLowerCase().includes("recipe")));
}
