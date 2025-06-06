import { compose, getDescriptor } from '@/utils';
import { RequestContext, ResponseContext } from './interceptor';

const OriginalXMLHttpRequest = window.XMLHttpRequest;

interface InternalNetpal {
  requestUrl: URL | string;
  requestResolved: (ctx: RequestContext) => void;
  requestPending: Promise<RequestContext>;
  requestHeaders: Headers;
  eventHandler: (callback: (...args: any[]) => any, args: any[]) => any;
  listenerMap: Map<any, any>;
  response?: any;
  responseText?: string;
}

function getHeaders(headersStr: string) {
  const arr = headersStr.trim().split(/[\r\n]+/).filter(Boolean);
  const headers = new Headers();
  arr.forEach((line) => {
    const parts = line.split(': ');
    const header = parts.shift()!;
    const value = parts.join(': ');
    headers.set(header, value);
  });
  return headers;
}

class XMLHttpRequest extends OriginalXMLHttpRequest {

  public internalNetpal: InternalNetpal;

  constructor() {

    super();

    let requestResolved!: InternalNetpal['requestResolved'];
    const requestPending: InternalNetpal['requestPending'] = new Promise(resolve => {
      requestResolved = resolve;
    });

    let responsePending: Promise<ResponseContext>;

    const eventHandler: InternalNetpal['eventHandler'] = (callback, args) => {
      if (responsePending) {
        responsePending.then(() => {
          callback.apply(this, args);
        });
      } else {
        callback.apply(this, args);
      }
    };

    this.internalNetpal = {
      requestUrl: undefined!,
      requestResolved,
      requestPending,
      requestHeaders: new Headers(),
      eventHandler,
      listenerMap: new Map(),
    };

    super.addEventListener('readystatechange', () => {
      const responseType = super.responseType || 'text';
      if (super.readyState === OriginalXMLHttpRequest.DONE) {
        switch (responseType) {
          case 'text': {
            responsePending = requestPending.then(ctx => {
              return compose(window.netpalInterceptors.response)(
                new ResponseContext({
                  body: super.responseText,
                  request: ctx,
                  headers: getHeaders(super.getAllResponseHeaders()),
                  status: super.status,
                }),
              );
            }).then(ctx => {
              this.internalNetpal.response = ctx.body;
              this.internalNetpal.responseText = ctx.body;
              return ctx;
            });
            break;
          }
          case 'json': {
            responsePending = requestPending.then(ctx => {
              return compose(window.netpalInterceptors.response)(
                new ResponseContext({
                  body: JSON.stringify(super.response),
                  request: ctx,
                  headers: getHeaders(super.getAllResponseHeaders()),
                  status: super.status,
                }),
              );
            }).then(ctx => {
              this.internalNetpal.response = JSON.parse(ctx.body);
              return ctx;
            });
            break;
          }
        }
      }
    });

  }

  open(method: string, url: string | URL, ...restParams: any[]) {
    this.internalNetpal.requestUrl = url;
    this.internalNetpal.requestPending.then((ctx) => {
      super.open(
        method,
        ctx.getTransformedURL(),
        // @ts-ignore
        ...restParams,
      );
    });
  }

  setRequestHeader(name: string, value: string): void {
    this.internalNetpal.requestHeaders.set(name, value);
    this.internalNetpal.requestPending.then((ctx) => {
      if (ctx.headers.has(name)) {
        super.setRequestHeader(name, ctx.headers.get(name)!);
      }
    });
  }

  addEventListener(type: string, listener: (e: any) => any, options?: any) {
    this.internalNetpal.requestPending.then(() => {
      const fn = (...args: any[]) => {
        this.internalNetpal.eventHandler(listener, args);
      };
      this.internalNetpal.listenerMap.set(listener, fn);
      super.addEventListener(type, fn, options);
    });
  }

  removeEventListener(type: string, listener: (e: any) => any, options?: any): void {
    this.internalNetpal.requestPending.then(() => {
      const key = this.internalNetpal.listenerMap.get(listener);
      if (key) {
        this.internalNetpal.listenerMap.delete(key);
      }
      super.removeEventListener(type, key || listener, options);
    });
  }

  overrideMimeType(mime: string) {
    this.internalNetpal.requestPending.then(() => {
      super.overrideMimeType(mime);
    });
  }

  send(body?: any): void {
    compose(window.netpalInterceptors.request)(
      new RequestContext({
        type: 'xhr',
        url: this.internalNetpal.requestUrl,
        body,
        headers: new Headers(this.internalNetpal.requestHeaders),
      }),
    ).then((ctx) => {
      this.internalNetpal.requestResolved(ctx);
      return this.internalNetpal.requestPending;
    }).then(ctx => {
      ctx.headers.forEach((value, name) => {
        if (!this.internalNetpal.requestHeaders.has(name)) {
          super.setRequestHeader(name, value);
        }
      });
      super.send(ctx.body);
    });
  }

}

Object.defineProperty(XMLHttpRequest.prototype, 'response', {
  get(this: XMLHttpRequest) {
    if (typeof this.internalNetpal.response !== 'undefined') {
      return this.internalNetpal.response;
    }
    return getDescriptor(OriginalXMLHttpRequest.prototype, 'response')?.get?.call(this);
  },
});

Object.defineProperty(XMLHttpRequest.prototype, 'responseText', {
  get(this: XMLHttpRequest) {
    if (typeof this.internalNetpal.responseText !== 'undefined') {
      return this.internalNetpal.responseText;
    }
    return getDescriptor(OriginalXMLHttpRequest.prototype, 'responseText')?.get?.call(this);
  },
});

const keys = [
  'onreadystatechange',
  ...Object.getOwnPropertyNames(XMLHttpRequestEventTarget.prototype).filter(key => key.startsWith('on')),
] as (keyof typeof OriginalXMLHttpRequest.prototype)[];
keys.forEach(key => {
  Object.defineProperty(XMLHttpRequest.prototype, key, {
    get(this: XMLHttpRequest) {
      return this.internalNetpal.listenerMap.get(key);
    },
    set(this: XMLHttpRequest, value) {
      this.internalNetpal.listenerMap.set(key, value);
      if (typeof value === 'function') {
        getDescriptor(OriginalXMLHttpRequest.prototype, key)?.set?.call(this, (...args: any[]) => {
          this.internalNetpal.eventHandler(value, args);
        });
      } else {
        getDescriptor(OriginalXMLHttpRequest.prototype, key)?.set?.call(this, value);
      }
    },
    configurable: true,
  });
});

window.XMLHttpRequest = XMLHttpRequest;
