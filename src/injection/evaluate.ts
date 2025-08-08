import {
  emitMessageFromPage,
  sendMessageFromPage,
  handleInterceptorsChange,
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
    type: 'response',
    headers: transformHeaders(ctx.headers),
    status: ctx.status,
    body: typeof ctx.body === 'string' ? ctx.body : undefined,
    request: toSimpleRequest(ctx.request),
    timestamp: ctx.timestamp,
  } satisfies SimpleResponseContext;
}

async function evaluateScript<T = any>(item: Record<string, string>, simpleCtx: SimpleRequestContext | SimpleResponseContext) {
  return await sendMessageFromPage('evaluate-script', {
    key: item.key,
    params: {
      frameURL: window.location.href,
      ctx: simpleCtx,
    },
  }) as T;
}

let uninstaller: (() => void)[] = [];

function reload(interceptors?: { key: string; }[]) {
  uninstaller.forEach(uninstall => uninstall());
  uninstaller = [];
  interceptors?.forEach(item => {

    /** cancel token */
    let resolved: (() => void) | undefined = undefined;
    const cancel = new Promise<void>((resolve) => resolved = resolve);
    uninstaller.push(() => resolved?.());

    const req: Middleware<RequestContext> = async (ctx, next) => {
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
          type: 'request',
          id: ctx.id,
          key: item.key,
          before: simpleCtx as SimpleRequestContext,
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
      const simpleCtx = toSimple(ctx);
      const obj = await Promise.race([
        cancel,
        evaluateScript<SimpleResponseContext>(item, simpleCtx),
      ]);
      if (typeof obj !== 'undefined') {
        ctx.body = typeof ctx.body === 'string' ? obj.body : ctx.body;
        emitMessageFromPage('intercept-records', {
          type: 'response',
          id: ctx.id,
          key: item.key,
          before: simpleCtx as SimpleResponseContext,
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
