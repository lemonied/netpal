import { sendMessage, messageListener } from '@/utils';
import type { Middleware } from '@/utils';
import { RequestContext, ResponseContext } from './interceptor';
import type {
  SimpleRequestContext,
  SimpleResponseContext,
} from '@/components/Interceptors';
import { escapeRegExp } from 'lodash';

function transformHeaders(headers: Headers) {
  return Array.from(headers.entries());
}

function toSimpleRequest(ctx: RequestContext) {
  return {
    url: new URL(ctx.url, window.location.href).href,
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

async function evaluateScript(item: Record<string, string>, ctx: RequestContext | ResponseContext) {
  const isRequest = ctx instanceof RequestContext;
  const code = isRequest ? item.request : item.response;
  return await sendMessage('evaluate-script', `
const frameURL = ${JSON.stringify(window.location.href)};
(async (ctx) => {
  if (new RegExp(${JSON.stringify(escapeRegExp(item.regex))}).test(${isRequest ? 'ctx.url' : 'ctx.request.url'})) {
    const fn = ${code};
    return fn(ctx);
  }
  return ctx;
})(${JSON.stringify(toSimple(ctx))});
`);
}

let uninstall: (() => void)[] = [];

function reload(interceptors: any[]) {
  uninstall.forEach(fn => fn());
  uninstall = [];
  interceptors.forEach(item => {
    const req: Middleware<RequestContext> = async (ctx, next) => {
      if (item.enabled) {
        const obj = await evaluateScript(item, ctx) as SimpleRequestContext;
        if (obj) {
          ctx.url = obj.url;
          ctx.body = typeof ctx.body === 'string' ? obj.body : ctx.body;
          ctx.headers = new Headers(obj.headers);
        }
      }

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
      if (item.enabled) {
        const obj = await evaluateScript(item, ctx) as SimpleResponseContext;
        if (obj) {
          ctx.body = typeof ctx.body === 'string' ? obj.body : ctx.body;
        }
      }
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
