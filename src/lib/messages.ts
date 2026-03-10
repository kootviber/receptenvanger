import type { PageCapture } from "./page-capture";
import type { RecipeDocument } from "./recipe-schema";

export type ContentMessage = {
  type: "capture-page";
};

export type BackgroundMessage =
  | {
      type: "get-settings-status";
    }
  | {
      type: "analyze-capture";
      capture: PageCapture;
      manualNotes: string;
    };

export type SettingsStatus = {
  hasApiKey: boolean;
  model: string;
};

export type AnalyzeCaptureResult = {
  document: RecipeDocument;
};

export type BridgeSuccess<T> = {
  ok: true;
  result: T;
};

export type BridgeFailure = {
  ok: false;
  error: string;
};

export type BridgeResponse<T> = BridgeSuccess<T> | BridgeFailure;
