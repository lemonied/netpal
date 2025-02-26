
export const messageTypePrefix = 'netpal-';

export interface BridgeMessage {
  type: `${typeof messageTypePrefix}${string}`;
  key: string;
  data?: any;
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

export function sendMessage(options: BridgeMessage) {

  let resolved: (value: any) => void;
  let rejected: (error: any) => void;

  function eventHandler(e: MessageEvent) {
    const data = e.data;
    if (isBridgeMessage(data) && data.type === `${options.type}-reply` && data.key === options.key) {
      if (data.type === 'netpal-error') {
        rejected(new Error(data.error));
      } else {
        resolved(data.data);
      }
      window.removeEventListener('message', eventHandler);
    }
  };

  window.postMessage(options satisfies BridgeMessage, '*');

  window.addEventListener('message', eventHandler);

  return new Promise<any>((resolve, reject) => {
    resolved = resolve;
    rejected = reject;
  });
}

export function messageListener(cb: (e: BridgeMessage, res: (e: BridgeMessage) => void) => any) {
  function eventHandler(e: MessageEvent) {
    const data = e.data;
    if (isBridgeMessage(data)) {
      cb(data, (resMessage) => {
        window.postMessage(resMessage, '*');
      });
    }
  };
  window.addEventListener('message', eventHandler);
  return () => {
    window.removeEventListener('message', eventHandler);
  };
}
