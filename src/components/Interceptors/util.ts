
export interface SimpleRequestContext {
  url: string;
  headers: Record<string, string>;
  body?: string;
}

export interface SimpleRequestInterceptor {
  (ctx: SimpleRequestContext): Promise<SimpleRequestContext>;
}

export interface SimpleResponseContext {
  readonly headers: Record<string, string>;
  body?: string;
  readonly status: number;
  readonly request: SimpleRequestContext;
}

export interface SimpleResponseInterceptor {
  (ctx: SimpleResponseContext): Promise<SimpleResponseContext>;
}

export const DEFAULT_REQUEST_INTERCEPTOR = `
/**
 * @param {RequestContext} ctx
 * @returns {Promise<RequestContext>}
 */
async function requestInterceptor(ctx) {
  return ctx;
};
`.trim();

export const DEFAULT_RESPONSE_INTERCEPTOR = `
/**
 * @param {ResponseContext} ctx
 * @returns {Promise<ResponseContext>}
 */
async function responseInterceptor(ctx) {
  return ctx;
};
`.trim();
