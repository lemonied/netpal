import { buildMessage, getInterceptors, isBridgeMessage, isMatchType, messageReplySuffix, randomStr } from '@/utils';

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

  if (isBridgeMessage(message)) {
    switch (true) {
      case isMatchType(message, 'open-panel') && typeof tabId === 'number': {
        chrome.sidePanel.open({ tabId });
        break;
      }
      case isMatchType(message, 'get-panel-status'): {
        sendResponse({
          ...message,
          data: sidePanelIsOpen,
          type: `${message.type}${messageReplySuffix}`,
        });
        return true;
      }
      case isMatchType(message, 'get-interceptors'): {
        (async () => {
          const interceptors = await getInterceptors();
          sendResponse({
            ...message,
            data: interceptors,
            type: `${message.type}${messageReplySuffix}`,
          });
        })();
        return true;
      }
      default: {
        //
      }
    }
  }

});

chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

chrome.tabs.onActivated.addListener(async (info) => {
  chrome.tabs.sendMessage(info.tabId, buildMessage({
    type: 'interceptors-reload',
    key: randomStr('interceptors-reload'),
    data: await getInterceptors(),
  }));
});
