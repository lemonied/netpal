import { isBridgeMessage, isBubble, isSink, randomStr } from '@/utils';
import type { BridgeMessage } from '@/utils';

const isTop = window === window.top;

(() => {

  const injection = document.createElement('script');
  injection.type = 'module';
  injection.src = chrome.runtime.getURL('injection.js');
  const head = document.head || document.documentElement;
  if (head.firstChild) {
    head.insertBefore(injection, head.firstChild);
  } else {
    head.appendChild(injection);
  }

  if (isTop) {
    window.setTimeout(() => {
      const main = document.createElement('script');
      main.src = chrome.runtime.getURL('main.js');
      main.type = 'module';
      document.body.appendChild(main);
    }, 200);
  }
  
})();

(() => {

  let sandbox: HTMLIFrameElement | undefined;
  
  if (isTop) {
    /**
     * sandbox
     */
    sandbox = document.createElement('iframe');
    sandbox.src = chrome.runtime.getURL('sandbox.html');
    sandbox.style.display = 'none';
    window.addEventListener('load', () => {
      document.body.appendChild(sandbox!);
    });
  }
  
  window.addEventListener('message', (e) => {
    const data = e.data;
    if (!isBridgeMessage(data)) {
      return;
    }
    if (isTop && isSink(data)) {
      if (sandbox?.contentWindow) {
        sandbox.contentWindow.postMessage({
          ...data,
          direction: 'sink',
        } satisfies BridgeMessage, '*');
      } else {
        window.postMessage({
          ...data,
          error: 'sandbox.contentWindow is undefined',
          type: 'netpal-error',
          direction: 'bubble',
        } satisfies BridgeMessage, '*');
      }
    }
    if (isBubble(data)) {
      chrome.runtime.sendMessage({
        ...data,
        direction: 'bubble',
      } satisfies BridgeMessage);
    }
  });
  
  const runtimeKey = randomStr('runtime');
  chrome.runtime.onMessage.addListener((e) => {
    if (!isBridgeMessage(e)) {
      return;
    }
    if (isBubble(e) && e.runtimeKey !== runtimeKey) {
      chrome.runtime.sendMessage({
        ...e,
        direction: 'sink',
        runtimeKey,
      } satisfies BridgeMessage);
    }
    if (isSink(e)) {
      window.postMessage({
        ...e,
        direction: 'sink',
      } satisfies BridgeMessage, '*');
    }
  });

})();
