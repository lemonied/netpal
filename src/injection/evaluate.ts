import { randomStr, sendMessage, messageListener } from '@/utils';
import type { Middleware } from '@/utils';
import { RequestContext, ResponseContext } from './interceptor';
import type {
  SimpleRequestContext,
  SimpleResponseContext,
} from '@/components/Interceptors';

function transformHeaders(headers: Headers) {
  return Array.from(headers.entries());
}

function toSimple(ctx: RequestContext | ResponseContext) {
  if (ctx instanceof RequestContext) {
    return {
      url: ctx.url,
      headers: transformHeaders(ctx.headers),
      body: typeof ctx.body === 'string' ? ctx.body : undefined,
    } satisfies SimpleRequestContext;
  }
  if (ctx instanceof ResponseContext) {
    return {
      headers: transformHeaders(ctx.headers),
      status: ctx.status,
      body: typeof ctx.body === 'string' ? ctx.body : undefined,
    } satisfies SimpleResponseContext;
  }
  return null;
}

async function evaluateScript(code: string, ctx: RequestContext | ResponseContext) {
  const key = randomStr('evaluateScript');
  return await sendMessage({
    type: 'netpal-script-evaluate',
    key,
    data: `(${code})(${JSON.stringify(toSimple(ctx))})`,
  });
}

let uninstall: (() => void)[] = [];

interface TransformedSimpleMiddleware {
  request: {
    key: string;
    fn: string;
  };
  response: {
    key: string;
    fn: string;
  };
}
function reload(interceptors: TransformedSimpleMiddleware[]) {
  uninstall.forEach(fn => fn());
  uninstall = [];
  interceptors.forEach(item => {
    const req: Middleware<RequestContext> = async (ctx) => {
      const obj = await evaluateScript(item.request.fn, ctx) as SimpleRequestContext;
      ctx.url = obj.url;
      ctx.body = typeof ctx.body === 'string' ? obj.body : ctx.body;
      ctx.headers = new Headers(obj.headers);
    };
    window.netpalInterceptors.request.push(req);
    uninstall.push(() => {
      const index = window.netpalInterceptors.request.indexOf(req);
      if (index > -1) {
        window.netpalInterceptors.request.splice(index, 1);
      }
    });
  });
}

messageListener((e) => {
  if (e.type === 'netpal-interceptors-reload') {
    reload(e.data);
  }
});
