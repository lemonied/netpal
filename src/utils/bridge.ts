import { randomStr } from './random';

export const messageTypePrefix = 'netpal-';

export interface BridgeMessage<T = any> {
  type: `${typeof messageTypePrefix}${string}`;
  key: string;
  data?: T;
  error?: string;
  direction?: 'bubble' | 'sink';
  runtimeKey?: string;
}

export function isBubble(data: BridgeMessage) {
  return !data.direction || data.direction === 'bubble';
}

export function isSink(data: BridgeMessage) {
  return !data.direction || data.direction === 'sink';
}

export function isBridgeMessage(val: unknown): val is BridgeMessage {
  return val && typeof (val as any).type === 'string' && (val as any).type.startsWith(messageTypePrefix);
}

export function sendMessage<T = any, R = any>(type: BridgeMessage<T>['type'], data?: BridgeMessage<T>['data']) {

  let resolved: (value: R) => void;
  let rejected: (error: any) => void;
  const birdgeMessage = {
    type,
    key: randomStr(type),
    data,
  } satisfies BridgeMessage;

  function eventHandler(e: MessageEvent) {
    const data = e.data;
    if (isBridgeMessage(data) && data.type === `${type}-reply` && data.key === birdgeMessage.key) {
      if (data.type === 'netpal-error') {
        rejected(new Error(data.error));
      } else {
        resolved(data.data);
      }
      window.removeEventListener('message', eventHandler);
    }
  };

  window.postMessage(birdgeMessage, '*');

  window.addEventListener('message', eventHandler);

  return new Promise<R>((resolve, reject) => {
    resolved = resolve;
    rejected = reject;
  });
}

export function messageListener<T = any, R = any>(
  type: BridgeMessage<T>['type'],
  cb: (data: BridgeMessage<T>['data'], resolve: (data?: BridgeMessage<R>['data']) => void, reject: (error: string) => void) => any,
  win: Window = window,
) {
  function eventHandler(e: MessageEvent) {
    const data = e.data;
    if (isBridgeMessage(data) && data.type === type) {
      cb(data.data, (resData) => {
        win.postMessage({
          type: `${type}-reply`,
          key: data.key,
          data: resData,
        } satisfies BridgeMessage, '*');
      }, (error) => {
        win.postMessage({
          type: 'netpal-error',
          key: data.key,
          error,
        } satisfies BridgeMessage, '*');
      });
    }
  };
  window.addEventListener('message', eventHandler);
  return () => {
    window.removeEventListener('message', eventHandler);
  };
}

export async function bridgeReady() {
  await sendMessage('netpal-sandbox-ready');
}
