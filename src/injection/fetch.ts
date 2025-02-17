import { compose } from '@/utils';

const originalFetch = window.fetch;

async function determineBodyType(instance: Request | Response) {
  const cloned = instance.clone();

  if (instance instanceof Request && ['GET', 'HEAD'].includes(instance.method)) {
    return {
      type: 'none',
      value: null,
    };
  }

  try {
    const value = await cloned.json();
    return {
      type: 'json',
      value: JSON.stringify(value),
    };
  } catch {
    // not json
  }

  try {
    const value = await cloned.text();
    return {
      type: 'text',
      value,
    };
  } catch {
    // not text
  }

  try {
    const value = await cloned.arrayBuffer();
    return {
      type: 'arrayBuffer',
      value,
    };
  } catch {
    // not arrayBuffer
  }

  try {
    const value = await cloned.blob();
    return {
      type: 'blob',
      value,
    };
  } catch {
    // not blob
  }

  try {
    const value = await cloned.bytes();
    return {
      type: 'bytes',
      value,
    };
  } catch {
    // not blob
  }

  try {
    const value = await cloned.formData();
    return {
      type: 'formData',
      value,
    };
  } catch {
    // not blob
  }

  return {
    type: 'unknown',
    value: null,
  };
}

const customFetch: typeof window.fetch = async (input, init) => {
  const request = input instanceof Request ? input : new Request(input, init);
  const requestBody = await determineBodyType(request);
  const requestCtx = await compose(window.netpalInterceptors.request)({
    type: 'fetch',
    url: new URL(request.url),
    headers: new Headers(request.headers),
    body: requestBody.value,
  });
  const response = await originalFetch(request, {
    headers: requestCtx.headers,
    body: requestBody.value,
  });
  const responseBody = await determineBodyType(response);
  const responseCtx = await compose(window.netpalInterceptors.response)({
    request: requestCtx,
    body: responseBody.value,
  });
  return new Response(responseCtx.body, response);
};

window.fetch = customFetch;
