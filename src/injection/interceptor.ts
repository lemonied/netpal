import { randomStr } from '@/utils';
import type { Middleware } from '@/utils';

class ContextBase {
  timestamp = Date.now();
}

export class RequestContext extends ContextBase {
  readonly originalUrl: URL | string;
  readonly type: 'fetch' | 'xhr';
  url: string;
  headers: Headers;
  body: any;
  id = randomStr('context');
  /**
   * available in xhr type
   */
  xhr?: XMLHttpRequest;
  getTransformedURL() {
    return this.originalUrl instanceof window.URL ? new URL(this.url, window.location.href) : this.url;
  }
  constructor(options: Pick<RequestContext, 'type' | 'headers' | 'body' | 'xhr'> & { url: RequestContext['originalUrl'] }) {
    super();
    const { type, url, headers, body, xhr } = options;
    this.type = type;
    this.originalUrl = url;
    this.url = url instanceof window.URL ? url.href : `${url}`;
    this.headers = headers;
    this.body = body;
    this.xhr = xhr;
  }
}

const requestInterceptors: Middleware<RequestContext>[] = [];

export class ResponseContext extends ContextBase {
  body: any;
  id: string;
  readonly request: Readonly<RequestContext>;
  readonly headers: Headers;
  readonly status: number;
  /**
   * available in fetch type
   */
  readonly response?: Response;
  constructor(options: Pick<ResponseContext, 'body' | 'request' | 'headers' | 'status' | 'response'>) {
    super();
    const { body, request, headers, status, response } = options;
    this.body = body;
    this.request = request;
    this.headers = headers;
    this.status = status;
    this.response = response;
    this.id = this.request.id;
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
