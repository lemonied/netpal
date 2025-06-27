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

export const interceptorFnStr = `
(ctx) => {
  return ctx;
};
`.trim();
