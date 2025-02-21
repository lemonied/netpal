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

  window.addEventListener('message', (e) => {
    if (e.data && e.data.type === 'netpal-message-send') {
      chrome.runtime.sendMessage(e.data.data, (res) => {
        window.postMessage({
          type: 'netpal-message-receive',
          data: res,
        }, '*');
      });
    }
  });

  chrome.runtime.onMessage();

})();
