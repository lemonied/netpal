import {
  buildMessage,
  isBridgeMessage,
  randomStr,
} from '@/utils';

export const debug = async (ctx: any) => {
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
        window.removeEventListener('message', listener);
      }
    };
    window.addEventListener('message', listener);
  });
  await promise;
};
