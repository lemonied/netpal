
export const messageTypePrefix = 'netpal-';

export interface BrigdeMessage {
  type: `${typeof messageTypePrefix}${string}`;
  key: string;
  data?: any;
  error?: string;
  footprints: string[];
}

export function isBridgeMessage(val: unknown): val is BrigdeMessage {
  return val && typeof (val as any).type === 'string' && (val as any).type.startsWith(messageTypePrefix);
}

export function sendMessage(options: Omit<BrigdeMessage, 'footprints'>) {

  let resolved: (value: any) => void;
  let rejected: (error: any) => void;

  function eventHandler(e: MessageEvent) {
    const data = e.data;
    if (isBridgeMessage(data) && data.key === options.key) {
      if (data.type === 'netpal-error') {
        rejected(new Error(data.error));
      } else {
        resolved(data.data);
      }
      window.removeEventListener('message', eventHandler);
    }
  };
  window.addEventListener('message', eventHandler);

  window.postMessage({
    ...options,
    footprints: [],
  } satisfies BrigdeMessage, '*');

  return new Promise<any>((resolve, reject) => {
    resolved = resolve;
    rejected = reject;
  });
}

export function messageListener(cb: (e: BrigdeMessage, res: (e: BrigdeMessage) => void) => any) {
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
