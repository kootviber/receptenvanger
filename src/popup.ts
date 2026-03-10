import { sendRuntimeMessage, sendTabMessage } from "./lib/bridge";
import type { AnalyzeCaptureResult, ContentMessage, SettingsStatus } from "./lib/messages";
import type { PageCapture } from "./lib/page-capture";

function requireElement<T extends HTMLElement>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) {
    throw new Error(`Element niet gevonden: ${selector}`);
  }
  return element;
}

async function getActiveTabId(): Promise<number> {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });

  if (!tab?.id) {
    throw new Error("Geen actieve tab gevonden.");
  }

  return tab.id;
}

async function captureCurrentTab(): Promise<PageCapture> {
  const tabId = await getActiveTabId();
  return sendTabMessage<ContentMessage, PageCapture>(tabId, { type: "capture-page" });
}

async function main(): Promise<void> {
  const captureButton = requireElement<HTMLButtonElement>("#capture-button");
  const copyButton = requireElement<HTMLButtonElement>("#copy-button");
  const downloadButton = requireElement<HTMLButtonElement>("#download-button");
  const openOptionsButton = requireElement<HTMLButtonElement>("#open-options");
  const notesInput = requireElement<HTMLTextAreaElement>("#manual-notes");
  const status = requireElement<HTMLParagraphElement>("#status");
  const settingsStatus = requireElement<HTMLParagraphElement>("#settings-status");
  const output = requireElement<HTMLElement>("#json-output");

  let latestJson = "";

  const refreshSettingsStatus = async (): Promise<void> => {
    const result = await sendRuntimeMessage<{ type: "get-settings-status" }, SettingsStatus>({
      type: "get-settings-status"
    });

    settingsStatus.textContent = result.hasApiKey
      ? `OpenAI key ingesteld. Model: ${result.model}`
      : "Nog geen OpenAI key ingesteld. Open eerst Options.";
  };

  await refreshSettingsStatus();

  openOptionsButton.addEventListener("click", () => {
    void chrome.runtime.openOptionsPage();
  });

  captureButton.addEventListener("click", () => {
    void (async () => {
      captureButton.disabled = true;
      status.textContent = "Pagina vastleggen en analyseren...";

      try {
        const capture = await captureCurrentTab();
        const result = await sendRuntimeMessage<
          { type: "analyze-capture"; capture: PageCapture; manualNotes: string },
          AnalyzeCaptureResult
        >({
          type: "analyze-capture",
          capture,
          manualNotes: notesInput.value
        });

        latestJson = JSON.stringify(result.document, null, 2);
        output.textContent = latestJson;
        status.textContent = "Recept-JSON gegenereerd.";
      } catch (error) {
        status.textContent = error instanceof Error ? error.message : "Onbekende fout";
      } finally {
        captureButton.disabled = false;
      }
    })();
  });

  copyButton.addEventListener("click", () => {
    if (!latestJson) {
      status.textContent = "Nog geen JSON om te kopiëren.";
      return;
    }

    void navigator.clipboard.writeText(latestJson).then(() => {
      status.textContent = "JSON gekopieerd.";
    });
  });

  downloadButton.addEventListener("click", () => {
    if (!latestJson) {
      status.textContent = "Nog geen JSON om te downloaden.";
      return;
    }

    const blob = new Blob([latestJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "recipe-document.json";
    anchor.click();
    URL.revokeObjectURL(url);
    status.textContent = "JSON gedownload.";
  });
}

void main();
