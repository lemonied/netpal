import { compose } from '@/utils';
import type { RequestContext, ResponseContext } from './interceptor';

const OriginalXMLHttpRequest = window.XMLHttpRequest;

class XMLHttpRequest extends OriginalXMLHttpRequest {

  internalNetpal: {
    requestUrl: URL;
    requestResolved: (ctx: RequestContext) => void;
    requestPending: Promise<RequestContext>;
    requestHeaderSettings: Record<string, string>;
    eventHandler: (e: any, callback: (e: any) => any) => any;
    listenerMap: Map<any, any>;
    response?: any;
    responseText?: string;
  };

  constructor() {

    super();

    let requestResolved!: XMLHttpRequest['internalNetpal']['requestResolved'];
    const requestPending: XMLHttpRequest['internalNetpal']['requestPending'] = new Promise(resolve => {
      requestResolved = resolve;
    });

    let responsePending: Promise<ResponseContext>;

    const eventHandler: XMLHttpRequest['internalNetpal']['eventHandler'] = (e, callback) => {
      if (responsePending) {
        responsePending.then(() => {
          callback.call(this, e);
        });
      } else {
        callback.call(this, e);
      }
    };

    this.internalNetpal = {
      requestUrl: new URL(location.href),
      requestResolved,
      requestPending,
      requestHeaderSettings: {},
      eventHandler,
      listenerMap: new Map(),
    };

    const onRecord: Record<string, any> = {};
    for (const key in this) {
      if (key.startsWith('on')) {
        Object.defineProperty(this, key, {
          get() {
            return onRecord[key];
          },
          set: (value) => {
            onRecord[key] = value;
            if (typeof value === 'function') {
              // @ts-ignore
              super[key] = (e: any) => {
                eventHandler(e, value);
              };
            } else {
              // @ts-ignore
              super[key] = value;
            }
          },
          configurable: true,
        });
      }
    }

    this.addEventListener('readystatechange', () => {
      const responseType = super.responseType || 'text';
      if (this.readyState === OriginalXMLHttpRequest.DONE) {
        switch (responseType) {
          case 'text': {
            responsePending = requestPending.then(ctx => {
              return compose(window.netpalInterceptors.response)({
                body: super.responseText,
                request: ctx,
              });
            }).then(ctx => {
              this.internalNetpal.response = ctx.body;
              this.internalNetpal.responseText = ctx.body;
              return ctx;
            });
            break;
          }
          case 'json': {
            responsePending = requestPending.then(ctx => {
              return compose(window.netpalInterceptors.response)({
                body: JSON.stringify(super.response),
                request: ctx,
              });
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

  open(method: string, url: string | URL, async?: any, user?: any, password?: any) {
    this.internalNetpal.requestUrl = new URL(url || '', location.href);
    this.internalNetpal.requestPending.then((ctx) => {
      super.open(method, ctx.url, async, user, password);
    });
  }

  setRequestHeader(name: string, value: string): void {
    this.internalNetpal.requestHeaderSettings[name] = value;
    this.internalNetpal.requestPending.then((ctx) => {
      Object.keys(ctx.headers).forEach(header => {
        super.setRequestHeader(header, ctx.headers[header]);
      });
    });
  }

  addEventListener(type: string, listener: (e: any) => any, options?: any) {
    this.internalNetpal.requestPending.then(() => {
      const fn = (e: any) => {
        this.internalNetpal.eventHandler(e, listener);
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
    compose(window.netpalInterceptors.request)({
      type: 'xhr',
      url: this.internalNetpal.requestUrl,
      body,
      headers: this.internalNetpal.requestHeaderSettings,
    }).then((ctx) => {
      this.internalNetpal.requestResolved(ctx);
      return this.internalNetpal.requestPending;
    }).then(ctx => {
      super.send(ctx.body);
    });
  }

}

Object.defineProperty(XMLHttpRequest.prototype, 'response', {
  get(this: XMLHttpRequest) {
    if (typeof this.internalNetpal.response !== 'undefined') {
      return this.internalNetpal.response;
    }
    return Object.getOwnPropertyDescriptor(OriginalXMLHttpRequest.prototype, 'response')?.get?.call(this);
  },
});

Object.defineProperty(XMLHttpRequest.prototype, 'responseText', {
  get(this: XMLHttpRequest) {
    if (typeof this.internalNetpal.responseText !== 'undefined') {
      return this.internalNetpal.responseText;
    }
    return Object.getOwnPropertyDescriptor(OriginalXMLHttpRequest.prototype, 'responseText')?.get?.call(this);
  },
});

window.XMLHttpRequest = XMLHttpRequest as unknown as typeof XMLHttpRequest;
