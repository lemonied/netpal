import type { Middleware } from '@/utils';

export class RequestContext {
  readonly originalUrl: URL | string;
  readonly type: 'fetch' | 'xhr';
  url: string;
  headers: Headers;
  body: any;
  getTransformedURL() {
    return this.originalUrl instanceof window.URL ? new URL(this.url, window.location.href) : this.url;
  }
  constructor(options: Pick<RequestContext, 'type' | 'headers' | 'body'> & { url: RequestContext['originalUrl'] }) {
    const { type, url, headers, body } = options;
    this.type = type;
    this.originalUrl = url;
    this.url = url instanceof window.URL ? url.href : `${this.originalUrl}`;
    this.headers = headers;
    this.body = body;
  }
}

const requestInterceptors: Middleware<RequestContext>[] = [];

export class ResponseContext {
  body: any;
  readonly request: Readonly<RequestContext>;
  readonly headers: Headers;
  readonly status: number;
  constructor(options: Pick<ResponseContext, 'body' | 'request' | 'headers' | 'status'>) {
    const { body, request, headers, status } = options;
    this.body = body;
    this.request = request;
    this.headers = headers;
    this.status = status;
  }
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
