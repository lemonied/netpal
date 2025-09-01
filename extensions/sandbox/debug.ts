import {
  buildMessage,
  isBridgeMessage,
  randomStr,
} from '@/utils';

const debugQueue: Promise<void>[] = [];

export const debug = async (ctx: any) => {
  await Promise.all(debugQueue);
  const promise = new Promise<void>((resolve) => {
    const key = randomStr('debug');
    window.parent.postMessage(
      buildMessage({
        type: 'debug',
        key,
        data: ctx,
      }),
      '*',
    );
    const listener = (e: MessageEvent) => {
      const message = e.data;
      if (isBridgeMessage(message) && message.key === key) {
        resolve();
        Object.assign(ctx, message.data);
        const index = debugQueue.indexOf(promise);
        if (index > -1) {
          debugQueue.splice(index, 1);
        }
        window.removeEventListener('message', listener);
      }
    };
    window.addEventListener('message', listener);
  });
  debugQueue.push(promise);
  await promise;
};
