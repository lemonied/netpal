import { buildMessage, buildReplyMessage, parseMessage, randomStr } from '@/utils';

/**
 * @description 参考文档
 * @see https://developer.chrome.com/docs/extensions/reference/api
 */

async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  return tab;
}

let sidePanelIsOpen = false;
async function notifySidePanelStat() {
  const tabId = (await getCurrentTab()).id;
  if (typeof tabId === 'number') {
    chrome.tabs.sendMessage(tabId, buildMessage({
      type: 'panel-status',
      key: randomStr('panel-status'),
      data: sidePanelIsOpen,
    }));
  }
}

chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'sidePanelStat') {
    sidePanelIsOpen = true;
    notifySidePanelStat();
    port.onDisconnect.addListener(() => {
      sidePanelIsOpen = false;
      notifySidePanelStat();
    });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

  const tabId = sender.tab?.id;

  if (typeof tabId === 'number') {
    parseMessage(message, (data) => {
      if (data.type === 'open-panel') {
        chrome.sidePanel.open({ tabId });
      }
      if (data.type === 'get-panel-status') {
        chrome.tabs.sendMessage(tabId, buildReplyMessage(data, sidePanelIsOpen));
      }
      chrome.tabs.sendMessage(tabId, buildMessage(data));
    });
  }

  sendResponse('service-worker copy');
});

chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
