import { isBridgeMessage, isBubble, isSink, messageListener, randomStr } from '@/utils';
import type { BridgeMessage } from '@/utils';

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

  let sandboxResolve: () => void;
  const sandboxReady = new Promise<void>((resolve) => {
    sandboxResolve = resolve;
  });
  
  if (isTop) {
    /**
     * sandbox
     */
    sandbox = document.createElement('iframe');
    sandbox.src = chrome.runtime.getURL('sandbox.html');
    sandbox.style.display = 'none';
    window.addEventListener('load', () => {
      document.body.appendChild(sandbox!);
      sandboxResolve();
    });
    messageListener('netpal-sandbox-ready', (_, resFn) => {
      /**
       * is sandbox ready
       */
      sandboxReady.then(() => {
        resFn();
      });
    });
  }
  
  (() => {
    /**
     * Message transfer
     */
    window.addEventListener('message', (e) => {
      const data = e.data;
      if (!isBridgeMessage(data)) {
        return;
      }
      if (isTop && isSink(data)) {
        sandbox?.contentWindow?.postMessage({
          ...data,
          direction: 'sink',
        } satisfies BridgeMessage, '*');
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
  

})();
