import { buildMessage, parseMessage } from '@/utils';

/**
 * @description 参考文档
 * @see https://developer.chrome.com/docs/extensions/reference/api
 */

// async function getCurrentTab() {
//   const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
//   return tab;
// }

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

  const tabId = sender.tab?.id;

  if (typeof tabId === 'number') {
    parseMessage(message, (data) => {
      chrome.tabs.sendMessage(tabId, buildMessage(data));
    });
  }

  sendResponse('service-worker copy');
});
