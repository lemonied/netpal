import {
  isBridgeMessage,
  isMatchType,
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
   * sandbox
   */

  const sandbox = document.createElement('iframe');
  sandbox.src = chrome.runtime.getURL('extensions/sandbox/index.html');
  sandbox.style.display = 'none';
  const sandboxReady = new Promise<void>((resolve) => {
    sandbox.onload = () => resolve();
  });

  if (!document.body) {
    window.addEventListener('load', () => {
      document.body.appendChild(sandbox);
    });
  } else {
    document.body.appendChild(sandbox);
  }

  /**
   * message transfer
   */
  window.addEventListener('message', (e) => {
    const data = e.data;
    if (isBridgeMessage(data)) {
      switch (true) {
        case isMatchType(data, 'evaluate-script'): {
          sandboxReady.then(() => {
            sandbox.contentWindow?.postMessage(data, '*');
          });
          break;
        }
        default: {
          chrome.runtime.sendMessage(data).then(res => {
            window.postMessage(res, '*');
          });
        }
      }
    }
  });
  chrome.runtime.onMessage.addListener((message) => {
    if (isBridgeMessage(message)) {
      window.postMessage(message, '*');
    }
  });
})();
