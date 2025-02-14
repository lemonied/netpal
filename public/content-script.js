'use strict';

(() => {
  const injection = document.createElement('script');
  injection.type = 'module';
  injection.src = chrome.runtime.getURL('injection.es.js');
  const firstChild = document.head.children[0];
  document.head.insertBefore(injection, firstChild || null);

  const main = document.createElement('script');
  main.type = 'module';
  main.src = chrome.runtime.getURL('main.es.js');
  document.head.insertBefore(main, injection);
})();
