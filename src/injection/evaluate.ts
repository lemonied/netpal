import { emitMessageFromPage, messageListenerForPage, sendMessageFromPage } from '@/utils';
import type { Middleware } from '@/utils';
import { RequestContext } from './interceptor';
import type { ResponseContext } from './interceptor';
import type {
  SimpleRequestContext,
  SimpleResponseContext,
} from '@/components/Interceptors';
import { escapeRegExp } from 'lodash';

function transformHeaders(headers: Headers) {
  return Array.from(headers.entries()).reduce<Record<string, string>>((pre, current) => {
    pre[current[0]] = current[1];
    return pre;
  }, {});
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
  return {
    headers: transformHeaders(ctx.headers),
    status: ctx.status,
    body: typeof ctx.body === 'string' ? ctx.body : undefined,
    request: toSimpleRequest(ctx.request),
  } satisfies SimpleResponseContext;
}

async function evaluateScript<T = any>(item: Record<string, string>, simpleCtx: SimpleRequestContext | SimpleResponseContext) {
  const isRequest = 'url' in simpleCtx;
  const code = isRequest ? item.request : item.response;
  return await sendMessageFromPage('evaluate-script', `
const frameURL = ${JSON.stringify(window.location.href)};
(async (ctx) => {
  if (new RegExp(${JSON.stringify(escapeRegExp(item.regex))}).test(${isRequest ? 'ctx.url' : 'ctx.request.url'})) {
    const fn = ${code};
    return fn(ctx);
  }
})(${JSON.stringify(simpleCtx)});
`) as T;
}

let uninstall: (() => void)[] = [];

function reload(interceptors: any[]) {
  uninstall.forEach(fn => fn());
  uninstall = [];
  interceptors.forEach(item => {

    /** cancel token */
    let resolved: (() => void) | undefined = undefined;
    const cancel = new Promise<void>((resolve) => resolved = resolve);
    uninstall.push(() => resolved?.());

    const req: Middleware<RequestContext> = async (ctx, next) => {
      if (item.enabled) {
        const simpleCtx = toSimple(ctx);
        const obj = await Promise.race([
          cancel,
          evaluateScript<SimpleRequestContext>(item, simpleCtx),
        ]);
        if (typeof obj !== 'undefined') {
          ctx.url = obj.url;
          ctx.body = typeof ctx.body === 'string' ? obj.body : ctx.body;
          ctx.headers = new Headers(obj.headers);
          emitMessageFromPage('intercept-records', {
            key: item.key,
            before: simpleCtx,
            after: toSimple(ctx),
          });
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
        const simpleCtx = toSimple(ctx);
        const obj = await Promise.race([
          cancel,
          evaluateScript<SimpleResponseContext>(item, simpleCtx),
        ]);
        if (typeof obj !== 'undefined') {
          ctx.body = typeof ctx.body === 'string' ? obj.body : ctx.body;
          emitMessageFromPage('intercept-records', {
            key: item.key,
            before: simpleCtx,
            after: toSimple(ctx),
          });
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

sendMessageFromPage('get-interceptors').then(data => {
  reload(data);
  resolved();
});

messageListenerForPage('interceptors-reload', (data) => {
  reload(data);
});
