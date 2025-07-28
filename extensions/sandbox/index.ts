import {
  buildMessage,
  isBridgeMessage,
  isMatchType,
  MESSAGE_REPLY_SUFFIX,
  randomStr,
} from '@/utils';

const debugQueue: Promise<void>[] = [];

const debug = async (ctx: any) => {
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
  return await promise;
};

window.addEventListener('message', async (e) => {
  const message = e.data;
  if (isBridgeMessage(message) && isMatchType(message, 'evaluate-script')) {
    const key = message.key;
    const script = message.data;
    try {
      const fn = new Function('debug', script);
      const result = fn(debug);
      window.parent.postMessage({
        type: `${message.type}${MESSAGE_REPLY_SUFFIX}`,
        key,
        data: await result,
      }, '*');
    } catch (e: any) {
      window.parent.postMessage({
        type: `${message.type}${MESSAGE_REPLY_SUFFIX}`,
        error: e?.message,
        data: undefined,
      }, '*');
    }
  }
});
