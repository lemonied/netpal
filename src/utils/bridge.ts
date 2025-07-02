import { randomStr } from './random';

export const MESSAGE_TYPE_PREFIX = 'netpal-';

export const MESSAGE_REPLY_SUFFIX = '-reply';

export const NETPAL_EVENT_NAME = 'NetpalEvent';

interface BridgeMessage<T = any> {
  type: string;
  key: string;
  data?: T;
  error?: string;
}

export function buildMessage<T = any>(message: BridgeMessage<T>) {
  return {
    ...message,
    type: `${MESSAGE_TYPE_PREFIX}${message.type}`,
  } satisfies BridgeMessage<T>;
}

export function isBridgeMessage(val: unknown): val is BridgeMessage {
  return val && typeof (val as any).type === 'string' && (val as any).type.startsWith(MESSAGE_TYPE_PREFIX);
}

export function isMatchType<T extends BridgeMessage>(message: T, type: string) {
  return message.type === `${MESSAGE_TYPE_PREFIX}${type}`;
}

function isMatchReply<T extends BridgeMessage>(message: T, type: string) {
  return message.type === `${MESSAGE_TYPE_PREFIX}${type}${MESSAGE_REPLY_SUFFIX}`;
}

export function emitMessage<T = any>(type: BridgeMessage<T>['type'], data?: T) {
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

export function sendMessage<T = any, R = any>(...args: Parameters<typeof emitMessage<T>>) {

  let resolved: (value: R) => void;
  let rejected: (error: any) => void;
  const birdgeMessage = emitMessage(...args);
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

export function messageListener<T = any>( type: BridgeMessage<T>['type'], cb: (data: T) => any) {
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
