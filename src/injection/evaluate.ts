import {
  emitMessageFromPage,
  sendMessageFromPage,
  handleInterceptorsChange,
  sleep,
} from '@/utils';
import type { Middleware } from '@/utils';
import { RequestContext } from './interceptor';
import type { ResponseContext } from './interceptor';
import type {
  RequestRecord,
  ResponseRecord,
  SimpleRequestContext,
  SimpleResponseContext,
} from '@/views/SidePanel/utils';

function transformHeaders(headers: Headers) {
  return Array.from(headers.entries()).reduce<Record<string, string>>((pre, current) => {
    pre[current[0]] = current[1];
    return pre;
  }, {});
}

function toSimpleRequest(ctx: RequestContext): SimpleRequestContext {
  return {
    id: ctx.id,
    type: 'request',
    initiator: ctx.type,
    url: new URL(ctx.url, window.location.href).href,
    headers: transformHeaders(ctx.headers),
    body: typeof ctx.body === 'string' ? ctx.body : undefined,
    timestamp: ctx.timestamp,
  };
}

function toSimple(ctx: RequestContext | ResponseContext): SimpleRequestContext | SimpleResponseContext {

  if (ctx instanceof RequestContext) {
    return toSimpleRequest(ctx);
  }
  return {
    id: ctx.id,
    type: 'response',
    headers: transformHeaders(ctx.headers),
    status: ctx.status,
    body: typeof ctx.body === 'string' ? ctx.body : undefined,
    request: toSimpleRequest(ctx.request),
    timestamp: ctx.timestamp,
  } satisfies SimpleResponseContext;
}

async function evaluateScript<T = any>(item: Record<string, string>, ctx: RequestContext | ResponseContext): Promise<T | null | undefined> {
  const simpleCtx = toSimple(ctx);
  const frameURL = window.location.href;
  if (!item.sandbox) {
    const interceptor = await sendMessageFromPage('get-interceptor-detail', {
      key: item.key,
    });
    const isRequest = ctx instanceof RequestContext;
    if (interceptor) {
      const code = isRequest ? interceptor.request : interceptor.response;
      const files: any[] = (isRequest ? interceptor.requestFiles : interceptor.responseFiles) || [];
      const script = `return (async () => {
  const fn = ${code};
  return fn(ctx);
})();`;
      const debug = async (data: any) => {
        const value = await sendMessageFromPage('debug', data);
        Object.assign(data, value);
      };
      const params = {
        ctx: simpleCtx,
        frameURL,
        files,
        sleep,
        debug,
      };
      Object.defineProperty(simpleCtx, 'nativeCtx', {
        enumerable: false,
        get() {
          return ctx;
        },
      });
      const fn = new Function(...Object.keys(params), script);
      return await fn(...Object.values(params));
    }
    return null;
  }

  /**
   * sandbox
   */
  const res = await sendMessageFromPage('evaluate-script', {
    key: item.key,
    params: {
      frameURL,
      ctx: simpleCtx,
    },
  });
  return res as T;
}

let uninstaller: (() => void)[] = [];

function reload(interceptors?: any[]) {
  uninstaller.forEach(uninstall => uninstall());
  uninstaller = [];
  interceptors?.forEach(item => {

    /** cancel token */
    let resolved: (() => void) | undefined = undefined;
    const cancel = new Promise<void>((resolve) => resolved = resolve);
    uninstaller.push(() => resolved?.());

    const req: Middleware<RequestContext> = async (ctx, next) => {
      const before = toSimple(ctx) as SimpleRequestContext;
      if (item.enabled && new RegExp(item.regex).test(before.url)) {
        const obj = await Promise.race([
          cancel,
          evaluateScript<SimpleRequestContext>(item, ctx),
        ]);
        if (obj) {
          ctx.url = obj.url;
          ctx.headers = new Headers(obj.headers);
          if (item.sandbox) {
            ctx.body = typeof ctx.body === 'string' ? obj.body : ctx.body;
          } else {
            ctx.body = obj.body;
          }
        }
        emitMessageFromPage('intercept-records', {
          type: 'request',
          id: ctx.id,
          key: item.key,
          before: before,
          after: {
            ...toSimple(ctx),
            timestamp: Date.now(),
          } as SimpleRequestContext,
        } satisfies RequestRecord);
      }
      await next();
    };
    window.netpalInterceptors.request.push(req);
    uninstaller.push(() => {
      const index = window.netpalInterceptors.request.indexOf(req);
      if (index > -1) {
        window.netpalInterceptors.request.splice(index, 1);
      }
    });

    const res: Middleware<ResponseContext> = async (ctx, next) => {
      const before = toSimple(ctx) as SimpleResponseContext;
      if (item.enabled && new RegExp(item.regex).test(before.request.url)) {
        const obj = await Promise.race([
          cancel,
          evaluateScript<SimpleResponseContext>(item, ctx),
        ]);
        if (obj) {
          if (item.sandbox) {
            ctx.body = typeof ctx.body === 'string' ? obj.body : ctx.body;
          } else {
            ctx.body = obj.body;
          }
        }
        emitMessageFromPage('intercept-records', {
          type: 'response',
          id: ctx.id,
          key: item.key,
          before: before,
          after: {
            ...toSimple(ctx),
            timestamp: Date.now(),
          } as SimpleResponseContext,
        } satisfies ResponseRecord);
      }
      await next();
    };
    window.netpalInterceptors.response.push(res);
    uninstaller.push(() => {
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

handleInterceptorsChange((data) => {
  reload(data);
  resolved();
});
