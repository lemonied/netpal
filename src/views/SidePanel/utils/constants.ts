export const DEFAULT_REQUEST_INTERCEPTOR = `
/** @type {RequestInterceptor} */
async function requestInterceptor(ctx) {
  return ctx;
};
`.trim();

export const DEFAULT_RESPONSE_INTERCEPTOR = `
/** @type {ResponseInterceptor} */
async function responseInterceptor(ctx) {
  return ctx;
};
`.trim();
