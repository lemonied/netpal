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
    const { interceptor, params } = message.data;
    const { ctx } = params;
    const isRequest = 'url' in ctx;
    const code = isRequest ? interceptor.request : interceptor.response;
    const files: any[] = (isRequest ? interceptor.requestFiles : interceptor.responseFiles) || [];
    const script = `
return (async (ctx) => {
  if (new RegExp(${JSON.stringify(interceptor.regex)}).test(${isRequest ? 'ctx.url' : 'ctx.request.url'})) {
    const fn = ${code};
    return fn(ctx);
  }
})(ctx);
`;
    try {
      const mergedParams = Object.keys(params).reduce((pre, key) => {
        pre.push({
          label: key,
          value: params[key],
        });
        return pre;
      }, [
        {
          label: 'debug',
          value: debug as any,
        },
        {
          label: 'files',
          value: files.map(v => v.content),
        },
      ]);
      const fn = new Function(...mergedParams.map(v => v.label), script);
      const result = fn(...mergedParams.map(v => v.value));
      window.parent.postMessage({
        type: `${message.type}${MESSAGE_REPLY_SUFFIX}`,
        key,
        data: await result,
      }, '*');
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.error(e);
      window.parent.postMessage({
        type: `${message.type}${MESSAGE_REPLY_SUFFIX}`,
        error: e?.message,
        data: undefined,
      }, '*');
    }
  }
});
