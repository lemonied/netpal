import { randomStr } from './random';

const messageTypePrefix = 'netpal-';

export const messageReplySuffix = '-reply';

export const netpalEventName = 'NetpalEvent';

interface BridgeMessage<T = any> {
  type: string;
  key: string;
  data?: T;
  error?: string;
}

export function buildMessage<T = any>(message: BridgeMessage<T>) {
  return {
    ...message,
    type: `${messageTypePrefix}${message.type}`,
  } satisfies BridgeMessage<T>;
}

export function isBridgeMessage(val: unknown): val is BridgeMessage {
  return val && typeof (val as any).type === 'string' && (val as any).type.startsWith(messageTypePrefix);
}

export function isMatchType<T extends BridgeMessage>(message: T, type: string) {
  return message.type === `${messageTypePrefix}${type}`;
}

function parseMessage<T = any>(message: unknown, cb: (message: BridgeMessage<T>) => void) {
  if (isBridgeMessage(message)) {
    cb({
      ...message,
      type: message.type.replace(messageTypePrefix, ''),
    });
  }
}

function buildReplyMessage<T = any>(message: BridgeMessage, data?: T, error?: string) {
  return buildMessage({
    type: `${message.type}${messageReplySuffix}`,
    key: message.key,
    data,
    error,
  });
}

export function emitMessage<T = any>(type: BridgeMessage<T>['type'], data?: T) {
  const birdgeMessage = {
    type,
    key: randomStr(type),
    data,
  } satisfies BridgeMessage<T>;
  window.dispatchEvent(new CustomEvent(netpalEventName, {
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
    parseMessage(e.detail, (data) => {
      if (data.type === `${type}${messageReplySuffix}` && data.key === birdgeMessage.key) {
        if (typeof data.error === 'string') {
          rejected(new Error(data.error));
        } else {
          resolved(data.data);
        }
        window.removeEventListener(netpalEventName, eventHandler as any);
      }
    });
  };

  window.addEventListener(netpalEventName, eventHandler as any);

  return new Promise<R>((resolve, reject) => {
    resolved = resolve;
    rejected = reject;
  });
}

export function messageListener<T = any, R = any>(
  type: BridgeMessage<T>['type'],
  cb: (data: T, resolve: (data?: R) => void, reject: (error: string) => void) => any,
) {
  function eventHandler(e: CustomEvent) {
    parseMessage(e.detail, (data) => {
      if (data.type === type) {
        cb(data.data, (resData) => {
          window.dispatchEvent(new CustomEvent(netpalEventName, {
            detail: buildReplyMessage(data, resData),
          }));
        }, (error) => {
          window.dispatchEvent(new CustomEvent(netpalEventName, {
            detail: buildReplyMessage(data, null, error),
          }));
        });
      }
    });
  };
  window.addEventListener(netpalEventName, eventHandler as any);
  return () => {
    window.removeEventListener(netpalEventName, eventHandler as any);
  };
}
