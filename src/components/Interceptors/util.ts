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
}

export interface SimpleResponseInterceptor {
  (ctx: SimpleResponseContext): Promise<SimpleResponseContext>;
}

export interface SimpleMiddleware {
  request: {
    key: string;
    fn: SimpleRequestInterceptor;
  };
  response: {
    key: string;
    fn: SimpleResponseInterceptor;
  };
}
