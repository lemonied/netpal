import { buildMessage, getInterceptors, isBridgeMessage, isMatchType, messageReplySuffix, randomStr } from '@/utils';

/**
 * @description 参考文档
 * @see https://developer.chrome.com/docs/extensions/reference/api
 */

async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  return tab;
}

let panelPort: chrome.runtime.Port | undefined = undefined;
async function notifySidePanelStat() {
  const tabId = (await getCurrentTab()).id;
  if (typeof tabId === 'number') {
    chrome.tabs.sendMessage(tabId, buildMessage({
      type: 'panel-status',
      key: randomStr('panel-status'),
      data: !!panelPort,
    }));
  }
}

chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'sidePanelStat') {
    panelPort = port;
    notifySidePanelStat();
    port.onDisconnect.addListener(() => {
      panelPort = undefined;
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
          data: !!panelPort,
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
      case isMatchType(message, 'evaluate-script'): {
        if (panelPort) {
          const listener = (msg: any) => {
            if (isBridgeMessage(msg) && msg.key === message.key) {
              sendResponse(msg);
              panelPort?.onMessage.removeListener(listener);
            }
          };
          panelPort.onMessage.addListener(listener);
          panelPort.postMessage(message);
        } else {
          sendResponse({
            ...message,
            type: `${message.type}${messageReplySuffix}`,
            data: undefined,
          });
        }
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
