import { captureCurrentPage } from "./lib/page-capture";
import type { ContentMessage } from "./lib/messages";

chrome.runtime.onMessage.addListener((message: ContentMessage, _sender, sendResponse) => {
  if (message.type !== "capture-page") {
    sendResponse(undefined);
    return false;
  }

  sendResponse(captureCurrentPage());
  return false;
});
