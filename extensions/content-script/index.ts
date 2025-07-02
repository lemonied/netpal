import {
  isBridgeMessage,
  NETPAL_EVENT_NAME,
} from '@/utils';

const isTop = window === window.top;

(() => {

  const injection = document.createElement('script');
  injection.type = 'module';
  injection.src = chrome.runtime.getURL('injection.js');
  injection.async = false;
  const head = document.head || document.documentElement;
  if (head.firstChild) {
    head.insertBefore(injection, head.firstChild);
  } else {
    head.appendChild(injection);
  }

  if (isTop) {
    window.addEventListener('load', () => {
      const panelTrigger = document.createElement('script');
      panelTrigger.src = chrome.runtime.getURL('panel-trigger.js');
      panelTrigger.type = 'module';
      head.appendChild(panelTrigger);
    });
  }

})();

(() => {

  /**
   * message transfer
   */
  window.addEventListener(NETPAL_EVENT_NAME, ((e) => {
    const data = (e as CustomEvent).detail;
    if (isBridgeMessage(data)) {
      chrome.runtime.sendMessage(data).then(res => {
        window.dispatchEvent(new CustomEvent(NETPAL_EVENT_NAME, {
          detail: res,
        }));
      });
    }
  }));
  chrome.runtime.onMessage.addListener((message) => {
    if (isBridgeMessage(message)) {
      window.dispatchEvent(new CustomEvent(NETPAL_EVENT_NAME, {
        detail: message,
      }));
    }
  });
})();
