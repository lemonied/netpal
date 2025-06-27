import { randomStr } from './random';

const messageTypePrefix = 'netpal-';

interface BridgeMessage<T = any> {
  type: string;
  key: string;
  data?: T;
  error?: string;
  direction?: 'bubble' | 'sink';
  runtimeKey?: string;
}

export function buildMessage<T = any>(message: BridgeMessage<T>) {
  return {
    ...message,
    type: `${messageTypePrefix}${message.type}`,
  } satisfies BridgeMessage<T>;
}

function isBridgeMessage(val: unknown): val is BridgeMessage {
  return val && typeof (val as any).type === 'string' && (val as any).type.startsWith(messageTypePrefix);
}

export function parseMessage<T = any>(message: unknown, cb: (message: BridgeMessage<T>) => void) {
  if (isBridgeMessage(message)) {
    cb({
      ...message,
      type: message.type.replace(messageTypePrefix, ''),
    });
  }
}

export function buildReplyMessage<T = any>(message: BridgeMessage, data?: T, error?: string) {
  return buildMessage({
    type: `${message.type}-reply`,
    key: message.key,
    data,
    error,
  });
}

export function isBubble<T extends BridgeMessage>(data: T) {
  return !data.direction || data.direction === 'bubble';
}

export function isSink<T extends BridgeMessage>(data: T) {
  return !data.direction || data.direction === 'sink';
}

export function emitMessage<T = any>(type: BridgeMessage<T>['type'], data?: T, win: Window = window) {
  const birdgeMessage = {
    type,
    key: randomStr(type),
    data,
  } satisfies BridgeMessage<T>;
  win.postMessage(buildMessage(birdgeMessage), '*');
  return birdgeMessage;
}

export function sendMessage<T = any, R = any>(...args: Parameters<typeof emitMessage<T>>) {

  let resolved: (value: R) => void;
  let rejected: (error: any) => void;
  const birdgeMessage = emitMessage(...args);
  const type = args[0];

  function eventHandler(e: MessageEvent) {
    parseMessage(e.data, (data) => {
      if (data.type === `${type}-reply` && data.key === birdgeMessage.key) {
        if (typeof data.error === 'string') {
          rejected(new Error(data.error));
        } else {
          resolved(data.data);
        }
        window.removeEventListener('message', eventHandler);
      }
    });
  };

  window.addEventListener('message', eventHandler);

  return new Promise<R>((resolve, reject) => {
    resolved = resolve;
    rejected = reject;
  });
}

export function messageListener<T = any, R = any>(
  type: BridgeMessage<T>['type'],
  cb: (data: T, resolve: (data?: R) => void, reject: (error: string) => void) => any,
  resWin: Window = window,
) {
  function eventHandler(e: MessageEvent) {
    parseMessage(e.data, (data) => {
      if (data.type === type) {
        cb(data.data, (resData) => {
          resWin.postMessage(
            buildReplyMessage(data, resData),
            '*',
          );
        }, (error) => {
          resWin.postMessage(
            buildReplyMessage(data, null, error),
            '*',
          );
        });
      }
    });
  };
  window.addEventListener('message', eventHandler);
  return () => {
    window.removeEventListener('message', eventHandler);
  };
}

export async function bridgeReady() {
  await sendMessage('sandbox-ready');
}
