import { compose } from '@/utils';
import { RequestContext, ResponseContext } from './interceptor';

const originalFetch = window.fetch;

class FakeResponse extends Response {
  private readonly _url?: string;
  private readonly _type?: ResponseType;
  get url() {
    if (typeof this._url === 'string') {
      return this._url;
    }
    return super.url;
  }
  get type() {
    if (typeof this._type === 'string') {
      return this._type;
    }
    return super.type;
  }
  constructor(body?: BodyInit | null, init?: ResponseInit, extraOption?: Pick<Response, 'url' | 'type'>) {
    super(body, init);
    this._url = extraOption?.url;
    this._type = extraOption?.type;
  }
  clone() {
    const cloned = new FakeResponse(this.body, this, {
      type: this.type,
      url: this.url,
    });
    return cloned;
  }
}

async function determineBodyType(instance: Request | Response) {

  if (instance instanceof Request && ['GET', 'HEAD'].includes(instance.method)) {
    return {
      type: 'none',
      value: null,
    };
  }

  if (instance instanceof Response && [204, 304].includes(instance.status)) {
    return {
      type: 'none',
      value: null,
    };
  }

  const contentType = instance.headers.get('content-type');

  if ([
    'text/html',
    'text/plain',
    'text/xml',
    'text/javascript',
    'text/css',
    'application/xml',
  ].some(value => contentType?.includes(value))) {
    try {
      const value = await instance.clone().text();
      return {
        type: 'text',
        value,
      };
    } catch {
      // not text
    }
  }

  if ([
    'application/json',
  ].some(value => contentType?.includes(value))) {
    try {
      const value = await instance.clone().text();
      return {
        type: 'json',
        value,
      };
    } catch {
      // not json
    }
  }  

  return {
    type: 'unknown',
    value: await instance.clone().arrayBuffer(),
  };
}

const customFetch: typeof window.fetch = async (input, init) => {
  let requestCtx: RequestContext;
  let response: Response;
  if (input instanceof Request) {
    const request = input;
    const requestBody = await determineBodyType(request);
    requestCtx = await compose(window.netpalInterceptors.request)(
      new RequestContext({
        type: 'fetch',
        url: request.url,
        headers: new Headers(request.headers),
        body: requestBody.value,
      }),
    );
    response = await originalFetch(request, {
      headers: requestCtx.headers,
      body: requestCtx.body,
    });
  } else {
    requestCtx = await compose(window.netpalInterceptors.request)(
      new RequestContext({
        type: 'fetch',
        url: input,
        headers: new Headers(init?.headers),
        body: init?.body,
      }),
    );
    response = await originalFetch(
      requestCtx.getTransformedURL(),
      {
        ...init,
        headers: requestCtx.headers,
        body: requestCtx.body,
      },
    );
  }
  const responseBody = await determineBodyType(response);
  const responseCtx = await compose(window.netpalInterceptors.response)(
    new ResponseContext({
      request: requestCtx,
      body: responseBody.value,
      headers: response.headers,
      status: response.status,
    }),
  );
  const mergedResponse = new FakeResponse(responseCtx.body, {
    headers: response.headers,
    status: response.status,
    statusText: response.statusText,
  }, {
    url: response.url,
    type: response.type,
  });
  return mergedResponse;
};

window.fetch = customFetch;
