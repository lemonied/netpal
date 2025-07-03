interface SharedSimpleContext {
  headers: [string, string][];
  body?: string;
}

export interface SimpleRequestContext extends SharedSimpleContext {
  url: string;
}

export interface SimpleRequestInterceptor {
  (ctx: SimpleRequestContext): Promise<SimpleRequestContext>;
}

export interface SimpleResponseContext extends SharedSimpleContext {
  status: number;
  request: SimpleRequestContext;
}

export interface SimpleResponseInterceptor {
  (ctx: SimpleResponseContext): Promise<SimpleResponseContext>;
}
/**
 * @returns
 */
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
