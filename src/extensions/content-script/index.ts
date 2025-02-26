import { isBridgeMessage, randomStr } from '@/utils';
import type { BrigdeMessage } from '@/utils';

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
    sandbox = document.createElement('iframe');
    sandbox.src = chrome.runtime.getURL('sandbox.html');
    sandbox.style.display = 'none';
    const sandboxKey = randomStr('sandbox');
    window.addEventListener('load', () => {
      document.body.appendChild(sandbox!);
      sandbox!.contentWindow?.addEventListener('message', (e) => {
        const data = e.data;
        if (isBridgeMessage(data) && !data.footprints.includes(sandboxKey)) {
          data.footprints.push(sandboxKey);
          window.postMessage(data, '*');
        }
      });
    });
  }

  const windowKey = randomStr('window');
  window.addEventListener('message', (e) => {
    const data = e.data;
    if (isBridgeMessage(data) && !data.footprints.includes(windowKey)) {
      const nextData: BrigdeMessage = {
        ...data,
        footprints: [...data.footprints, windowKey],
      };
      chrome.runtime.sendMessage(nextData);
      if (sandbox?.contentWindow) {
        sandbox.contentWindow.postMessage(nextData, '*');
      } else if (isTop) {
        window.postMessage({
          ...nextData,
          footprints: [windowKey],
          error: 'sandbox.contentWindow is undefined',
          type: 'netpal-error',
        } satisfies BrigdeMessage, '*');
      }
    }
  });

  const runtimeKey = randomStr('runtime');
  chrome.runtime.onMessage.addListener((e) => {
    if (isBridgeMessage(e) && !e.footprints.includes(runtimeKey)) {
      e.footprints.push(runtimeKey);
      window.postMessage(e, '*');
    }
  });

})();
