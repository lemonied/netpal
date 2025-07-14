import { buildMessage, isBridgeMessage, isMatchReply, isMatchType, NETPAL_EVENT_NAME } from './bridge';
import type { BridgeMessage } from './bridge';
import { randomStr } from './random';

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
      window.removeEventListener(NETPAL_EVENT_NAME, eventHandler as any);
    }
  };

  window.addEventListener(NETPAL_EVENT_NAME, eventHandler as any);

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
  window.addEventListener(NETPAL_EVENT_NAME, eventHandler as any);
  return () => {
    window.removeEventListener(NETPAL_EVENT_NAME, eventHandler as any);
  };
}
