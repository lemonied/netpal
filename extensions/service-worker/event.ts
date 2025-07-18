import {
  buildMessage,
  getInterceptors,
  isBridgeMessage,
  isMatchType,
  MESSAGE_REPLY_SUFFIX,
  portListener,
  randomStr,
} from '@/utils';
import { getCurrentTab } from './util';
import type { BridgeMessage } from '@/utils';

/**
 * side panel 关闭状态下为undefined
 */
let panelPort: chrome.runtime.Port | undefined = undefined;
async function notifySidePanelStat() {
  const tabId = (await getCurrentTab()).id;
  if (typeof tabId === 'number') {
    chrome.tabs.sendMessage(tabId, buildMessage({
      type: 'panel-status',
      key: randomStr('panel-status'),
      data: !!panelPort,
      source: 'service',
    }));
  }
}

chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'sidePanelStat') {
    panelPort = port;
    notifySidePanelStat();
    portListener({
      onDisconnect() {
        panelPort = undefined;
        notifySidePanelStat();
      },
      onMessage(message) {
        (async () => {
          switch (true) {
            case isBridgeMessage(message) && isMatchType(message, 'interceptors-reload'): {
              (async () => {
                const tabId = (await getCurrentTab()).id;
                if (typeof tabId === 'number') {
                  chrome.tabs.sendMessage(tabId, {
                    ...message,
                    source: 'service',
                  } satisfies BridgeMessage);
                }
              })();
              break;
            }
            default: {
              // nothing
            }
          }
        })();
      },
    }, port);
  }
});

chrome.tabs.onActivated.addListener(async (info) => {
  chrome.tabs.sendMessage(info.tabId, buildMessage({
    type: 'interceptors-reload',
    key: randomStr('interceptors-reload'),
    data: panelPort ? await getInterceptors() : [],
    source: 'service',
  }));
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
          type: `${message.type}${MESSAGE_REPLY_SUFFIX}`,
          source: 'service',
        } satisfies BridgeMessage);
        return true;
      }
      case isMatchType(message, 'get-interceptors'): {
        (async () => {
          const interceptors = await getInterceptors();
          sendResponse({
            ...message,
            data: interceptors,
            type: `${message.type}${MESSAGE_REPLY_SUFFIX}`,
            source: 'service',
          } satisfies BridgeMessage);
        })();
        return true;
      }
      case isMatchType(message, 'intercept-records'): {
        /**
         * 发送给side_panel但不需要回复
         */
        panelPort?.postMessage(message);
        break;
      }
      default: {
        /**
         * 发送给side panel并且需要回复
         * side panel处于打开状态时，执行请求/响应拦截，否则返回undefined
         */
        const responseEmpty = () => {
          sendResponse({
            ...message,
            type: `${message.type}${MESSAGE_REPLY_SUFFIX}`,
            data: undefined,
            source: 'service',
          } satisfies BridgeMessage);
        };
        const port = panelPort;
        if (port) {
          portListener({
            onMessage(msg) {
              if (isBridgeMessage(msg) && msg.key === message.key) {
                sendResponse({
                  ...msg,
                  source: 'service',
                } satisfies BridgeMessage);
                return true;
              }
            },
            onDisconnect() {
              responseEmpty();
            },
          }, port);
          port.postMessage(message);
        } else {
          responseEmpty();
        }
        return true;
      }
    }
  }

});
