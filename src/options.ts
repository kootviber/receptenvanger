import { clearApiKey, loadSettings, saveSettings } from "./lib/storage";

function requireElement<T extends HTMLElement>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) {
    throw new Error(`Element niet gevonden: ${selector}`);
  }
  return element;
}

async function main(): Promise<void> {
  const form = requireElement<HTMLFormElement>("#settings-form");
  const apiKeyInput = requireElement<HTMLInputElement>("#api-key");
  const modelInput = requireElement<HTMLInputElement>("#model");
  const status = requireElement<HTMLParagraphElement>("#status");
  const clearButton = requireElement<HTMLButtonElement>("#clear-api-key");

  const settings = await loadSettings();
  apiKeyInput.value = settings.apiKey;
  modelInput.value = settings.model;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    void (async () => {
      await saveSettings({
        apiKey: apiKeyInput.value,
        model: modelInput.value
      });

      status.textContent = "Instellingen opgeslagen.";
    })();
  });

  clearButton.addEventListener("click", () => {
    void (async () => {
      await clearApiKey();
      apiKeyInput.value = "";
      status.textContent = "API key verwijderd uit lokale extensie-opslag.";
    })();
  });
}

void main();
