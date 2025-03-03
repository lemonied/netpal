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
    chrome.tabs.sendMessage(tabId, message);
  }

  sendResponse('service-worker copy');
});
