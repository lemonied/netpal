import {
  isBridgeMessage,
  isMatchType,
  MESSAGE_REPLY_SUFFIX,
} from '@/utils';
import { debug } from './debug';
import { sleep } from './sleep';

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
          value: debug,
        },
        {
          label: 'files',
          value: files,
        },
        {
          label: 'sleep',
          value: sleep,
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
