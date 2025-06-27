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

function toSimpleRequest(ctx: RequestContext) {
  return {
    url: ctx.url,
    headers: transformHeaders(ctx.headers),
    body: typeof ctx.body === 'string' ? ctx.body : undefined,
  } satisfies SimpleRequestContext;
}

function toSimple(ctx: RequestContext | ResponseContext) {

  if (ctx instanceof RequestContext) {
    return toSimpleRequest(ctx);
  }
  if (ctx instanceof ResponseContext) {
    return {
      headers: transformHeaders(ctx.headers),
      status: ctx.status,
      body: typeof ctx.body === 'string' ? ctx.body : undefined,
      request: toSimpleRequest(ctx.request),
    } satisfies SimpleResponseContext;
  }
  return null;
}

async function evaluateScript(code: string, ctx: RequestContext | ResponseContext) {
  return await sendMessage('script-evaluate', `(async (ctx) => {const fn = ${code}\nreturn fn(ctx)})(${JSON.stringify(toSimple(ctx))})`);
}

let uninstall: (() => void)[] = [];

type TransformedSimpleMiddleware = [string, string];
function reload(interceptors: TransformedSimpleMiddleware[]) {
  uninstall.forEach(fn => fn());
  uninstall = [];
  interceptors.forEach(item => {
    const req: Middleware<RequestContext> = async (ctx, next) => {
      const obj = await evaluateScript(item[0], ctx) as SimpleRequestContext;
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
      const obj = await evaluateScript(item[1], ctx) as SimpleResponseContext;
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

let resolved: () => void;
const init = new Promise<void>(resolve => resolved = resolve);

window.netpalInterceptors.request.push(async (_, next) => {
  await bridgeReady();
  await init;
  await next();
});

sendMessage('get-interceptors').then(data => {
  reload(data);
  resolved();
});

messageListener('interceptors-reload', (data) => {
  reload(data);
});
