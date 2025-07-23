import {
  getInterceptors,
  isBridgeMessage,
  isMatchType,
  MESSAGE_REPLY_SUFFIX,
  NETPAL_EVENT_NAME,
  NETPAL_RUNTIME_EVENT_NAME,
} from '@/utils';
import type { BridgeMessage } from '@/utils';

function inject() {
  const isTop = window === window.top;
  const injection = document.createElement('script');
  injection.src = chrome.runtime.getURL('injection.js');
  const head = document.head || document.documentElement;
  head.insertBefore(injection, head.firstChild);

  if (isTop) {
    window.addEventListener('load', () => {
      const panelTrigger = document.createElement('script');
      panelTrigger.src = chrome.runtime.getURL('panel-trigger.js');
      panelTrigger.type = 'module';
      head.appendChild(panelTrigger);
    });
  }
}

function init() {
  /**
   * message transfer
   */
  window.addEventListener(NETPAL_EVENT_NAME, ((e) => {
    const message = (e as CustomEvent).detail;
    if (isBridgeMessage(message)) {
      switch (true) {
        case isMatchType(message, 'get-interceptors'): {
          (async () => {
            window.dispatchEvent(new CustomEvent(NETPAL_RUNTIME_EVENT_NAME, {
              detail: {
                ...message,
                data: await getInterceptors(),
                type: `${message.type}${MESSAGE_REPLY_SUFFIX}`,
              },
            }));
          })();
          break;
        }
        default: {
          chrome.runtime.sendMessage(message).then((res: BridgeMessage) => {
            window.dispatchEvent(new CustomEvent(NETPAL_RUNTIME_EVENT_NAME, {
              detail: res,
            }));
          });
        }
      }
    }
  }));
  chrome.runtime.onMessage.addListener((message) => {
    if (isBridgeMessage(message)) {
      window.dispatchEvent(new CustomEvent(NETPAL_RUNTIME_EVENT_NAME, {
        detail: message,
      }));
    }
  });
}

(() => {

  inject();
  init();
  // eslint-disable-next-line no-console
  console.log('netpal is enabled');

})();
