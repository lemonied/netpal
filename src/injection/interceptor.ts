import type { Middleware } from '@/utils';

export interface RequestContext {
  readonly type: 'fetch' | 'xhr';
  headers: Headers;
  url: URL;
  body: any;
}

const requestInterceptors: Middleware<RequestContext>[] = [
  async (ctx, next) => {
    ctx.headers.set('Hijacked-by', 'netpal');
    await next();
  },
];

export interface ResponseContext {
  body: any;
  readonly request: Readonly<RequestContext>;
}

const responseInterceptors: Middleware<ResponseContext>[] = [];

declare global {
  interface Window {
    netpalInterceptors: {
      request: typeof requestInterceptors;
      response: typeof responseInterceptors;
    };
  }
}

window.netpalInterceptors = {
  request: requestInterceptors,
  response: responseInterceptors,
};
