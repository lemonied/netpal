import {
  isBridgeMessage,
  isMatchType,
  MESSAGE_REPLY_SUFFIX,
  sleep,
} from '@/utils';
import type { BridgeMessage } from '@/utils';
import { debug } from './debug';

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
      const mergedParams = {
        ...params,
        debug,
        files,
        sleep,
      };
      const fn = new Function(...Object.keys(mergedParams), script);
      const result = fn(...Object.values(mergedParams));
      window.parent.postMessage({
        type: `${message.type}${MESSAGE_REPLY_SUFFIX}`,
        key,
        data: await result,
      } satisfies BridgeMessage, '*');
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.error(e);
      window.parent.postMessage({
        type: `${message.type}${MESSAGE_REPLY_SUFFIX}`,
        key,
        error: e?.message,
        data: undefined,
      } satisfies BridgeMessage, '*');
    }
  }
});
