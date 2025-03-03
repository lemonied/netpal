import {
  buildMessage,
  isBubble,
  isSink,
  messageListener,
  parseMessage,
  randomStr,
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
    sandbox.src = chrome.runtime.getURL('extensions/sandbox/index.html');
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
    const runtimeKey = randomStr('runtime');
    window.addEventListener('message', (e) => {
      parseMessage(e.data, (data) => {
        if (isTop && isSink(data)) {
          sandbox?.contentWindow?.postMessage(buildMessage({
            ...data,
            direction: 'sink',
          }), '*');
        }
        if (isBubble(data)) {
          chrome.runtime.sendMessage(buildMessage({
            ...data,
            direction: 'sink',
            runtimeKey,
          }));
        }
      });
    });

    chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
      parseMessage(message, (data) => {
        if (data.runtimeKey !== runtimeKey) {
          window.postMessage(buildMessage({
            ...data,
            direction: 'sink',
          }), '*');
        }
      });

      sendResponse({
        description: `content ${runtimeKey} copy`,
      });

    });
  })();


})();
