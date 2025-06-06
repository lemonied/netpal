import { sendMessage, messageListener, bridgeReady } from '@/utils';
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
  return await sendMessage('script-evaluate', `(${code})(${JSON.stringify(toSimple(ctx))})`);
}

window.netpalInterceptors.request.push(async (_, next) => {
  await bridgeReady();
  await next();
});

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
    const req: Middleware<RequestContext> = async (ctx, next) => {
      const obj = await evaluateScript(item.request.fn, ctx) as SimpleRequestContext;
      ctx.url = obj.url;
      ctx.body = typeof ctx.body === 'string' ? obj.body : ctx.body;
      ctx.headers = new Headers(obj.headers);
      await next();
    };
    window.netpalInterceptors.request.push(req);
    uninstall.push(() => {
      const index = window.netpalInterceptors.request.indexOf(req);
      if (index > -1) {
        window.netpalInterceptors.request.splice(index, 1);
      }
    });

    const res: Middleware<ResponseContext> = async (ctx, next) => {
      const obj = await evaluateScript(item.response.fn, ctx) as SimpleResponseContext;
      ctx.body = typeof ctx.body === 'string' ? obj.body : ctx.body;
      await next();
    };
    window.netpalInterceptors.response.push(res);
    uninstall.push(() => {
      const index = window.netpalInterceptors.response.indexOf(res);
      if (index > -1) {
        window.netpalInterceptors.response.splice(index, 1);
      }
    });
  });
}

messageListener('interceptors-reload', (data) => {
  reload(data);
});
