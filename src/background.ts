import { buildRecipeDocument } from "./lib/openai";
import type {
  AnalyzeCaptureResult,
  BackgroundMessage,
  BridgeFailure,
  BridgeSuccess,
  SettingsStatus
} from "./lib/messages";
import { loadSettings } from "./lib/storage";

async function handleMessage(message: BackgroundMessage): Promise<AnalyzeCaptureResult | SettingsStatus> {
  if (message.type === "get-settings-status") {
    const settings = await loadSettings();
    return {
      hasApiKey: settings.apiKey.length > 0,
      model: settings.model
    };
  }

  const settings = await loadSettings();
  if (!settings.apiKey) {
    throw new Error("Geen OpenAI API key gevonden. Stel deze eerst in via Options.");
  }

  const document = await buildRecipeDocument(message.capture, message.manualNotes, settings);

  return { document };
}

chrome.runtime.onMessage.addListener((message: BackgroundMessage, _sender, sendResponse) => {
  void handleMessage(message)
    .then((result) => {
      sendResponse({
        ok: true,
        result
      } satisfies BridgeSuccess<AnalyzeCaptureResult | SettingsStatus>);
    })
    .catch((error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : "Onbekende fout";
      sendResponse({
        ok: false,
        error: errorMessage
      } satisfies BridgeFailure);
    });

  return true;
});
