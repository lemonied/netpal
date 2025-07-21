import { debounce } from 'lodash';
import {
  buildMessage,
  isBridgeMessage,
  isMatchReply,
  isMatchType,
  NETPAL_EVENT_NAME,
  NETPAL_RUNTIME_EVENT_NAME,
} from './bridge';
import type { BridgeMessage } from './bridge';
import { randomStr } from './random';
import { onWindowFocus } from './scene';

export function emitMessageFromPage<T = any>(type: BridgeMessage<T>['type'], data?: T) {
  const birdgeMessage = {
    type,
    key: randomStr(type),
    data,
  } satisfies BridgeMessage<T>;
  window.dispatchEvent(new CustomEvent(NETPAL_EVENT_NAME, {
    detail: buildMessage(birdgeMessage),
  }));
  return birdgeMessage;
}

export function sendMessageFromPage<T = any, R = any>(...args: Parameters<typeof emitMessageFromPage<T>>) {

  let resolved: (value: R) => void;
  let rejected: (error: any) => void;
  const birdgeMessage = emitMessageFromPage(...args);
  const type = args[0];

  function eventHandler(e: CustomEvent) {
    const data = e.detail;
    if (isBridgeMessage(data) && isMatchReply(data, type) && data.key === birdgeMessage.key) {
      if (typeof data.error === 'string') {
        rejected(new Error(data.error));
      } else {
        resolved(data.data);
      }
      window.removeEventListener(NETPAL_RUNTIME_EVENT_NAME, eventHandler as any);
    }
  };

  window.addEventListener(NETPAL_RUNTIME_EVENT_NAME, eventHandler as any);

  return new Promise<R>((resolve, reject) => {
    resolved = resolve;
    rejected = reject;
  });
}

export function messageListenerForPage<T = any>( type: BridgeMessage<T>['type'], cb: (data: T) => any) {
  function eventHandler(e: CustomEvent) {
    const data = e.detail;
    if (isBridgeMessage(data) && isMatchType(data, type)) {
      cb(data.data);
    }
  };
  window.addEventListener(NETPAL_RUNTIME_EVENT_NAME, eventHandler as any);
  return () => {
    window.removeEventListener(NETPAL_RUNTIME_EVENT_NAME, eventHandler as any);
  };
}

export function handleSidePanelState(callback: (open: boolean) => void) {
  const uninstaller = [
    messageListenerForPage('panel-status', (data) => {
      callback(data);
    }),
    onWindowFocus(() => {
      sendMessageFromPage('get-panel-status').then(data => {
        callback(data);
      });
    }, {
      immediate: true,
    }),
  ];
  return () => {
    uninstaller.forEach(uninstall => uninstall());
  };
}

export function handleInterceptorsChange(fn: (data?: any[]) => void) {
  const run = debounce(fn, 20);
  const uninstaller = [
    onWindowFocus(() => {
      sendMessageFromPage('get-interceptors').then(data => {
        run(data);
      });
    }, {
      immediate: true,
    }),
    messageListenerForPage('interceptors-reload', (data) => {
      run(data);
    }),
    handleSidePanelState((state) => {
      if (state) {
        sendMessageFromPage('get-interceptors').then(data => {
          run(data);
        });
      } else {
        run();
      }
    }),
  ];
  return () => {
    uninstaller.forEach(uninstall => uninstall());
  };
}
