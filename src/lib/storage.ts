export type ExtensionSettings = {
  apiKey: string;
  model: string;
};

const DEFAULT_MODEL = "gpt-4.1-mini";

export async function loadSettings(): Promise<ExtensionSettings> {
  const stored = await chrome.storage.local.get(["openAiApiKey", "openAiModel"]);

  return {
    apiKey: typeof stored.openAiApiKey === "string" ? stored.openAiApiKey.trim() : "",
    model: typeof stored.openAiModel === "string" && stored.openAiModel.trim() ? stored.openAiModel.trim() : DEFAULT_MODEL
  };
}

export async function saveSettings(settings: ExtensionSettings): Promise<void> {
  await chrome.storage.local.set({
    openAiApiKey: settings.apiKey.trim(),
    openAiModel: settings.model.trim() || DEFAULT_MODEL
  });
}

export async function clearApiKey(): Promise<void> {
  await chrome.storage.local.remove("openAiApiKey");
}
