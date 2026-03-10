import type { BridgeResponse } from "./messages";

export async function sendRuntimeMessage<TRequest, TResponse>(message: TRequest): Promise<TResponse> {
  const response = (await chrome.runtime.sendMessage(message)) as BridgeResponse<TResponse>;
  if (!response.ok) {
    throw new Error(response.error);
  }

  return response.result;
}

export async function sendTabMessage<TRequest, TResponse>(tabId: number, message: TRequest): Promise<TResponse> {
  const response = (await chrome.tabs.sendMessage(tabId, message)) as TResponse;
  return response;
}
