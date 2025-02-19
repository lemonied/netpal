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
    const main = document.createElement('script');
    main.src = chrome.runtime.getURL('main.js');
    main.type = 'module';
    document.body.appendChild(main);
  }, 200);

})();
