'use strict';

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

  window.setTimeout(() => {
    if (window.top === window) {
      const main = document.createElement('script');
      main.src = chrome.runtime.getURL('main.js');
      main.type = 'module';
      document.body.appendChild(main);
    }
  }, 200);
  
  
})();
(() => {

  const map = new Map<string, (value: any) => void>();

  const sandbox = document.createElement('iframe');
  sandbox.src = chrome.runtime.getURL('sandbox.html');

  async function evaluateScript(code: string) {
    const key = `evaluate_${Math.random().toString(36).slice(2, 2 + 10)}`;
    sandbox.contentWindow?.postMessage({
      type: 'netpal-script-evaluate',
      key,
      data: code,
    }, '*');
    return await new Promise<any>((resolve) => {
      map.set(key, resolve);
    });
  }

  window.addEventListener('load', () => {
    document.body.appendChild(sandbox);
    sandbox.contentWindow?.addEventListener('message', (e) => {
      const data = e.data;
      if (data && data.type === 'netpal-script-result') {
        map.get(data.key)?.(data.data);
        map.delete(data.key);
      }
    });
  });

  chrome.runtime.onMessage.addListener((e) => {
    if (e && e.type === 'netpal-reload-config') {
      //
    }
  });

})();
