export interface SimpleRequestContext {
  readonly type: 'request';
  readonly initiator: 'xhr' | 'fetch';
  readonly timestamp: number;
  url: string;
  headers: Record<string, string>;
  body?: string;
}

export interface SimpleRequestInterceptor {
  (ctx: SimpleRequestContext): Promise<SimpleRequestContext>;
}

export interface SimpleResponseContext {
  readonly type: 'response';
  readonly timestamp: number;
  readonly headers: Record<string, string>;
  body?: string;
  readonly status: number;
  readonly request: SimpleRequestContext;
}

interface SharedRecord {
  id: string;
  key: string;
}

export interface RequestRecord extends SharedRecord {
  type: 'request';
  before: SimpleRequestContext;
  after: SimpleRequestContext,
}

export interface ResponseRecord extends SharedRecord {
  type: 'response';
  before: SimpleResponseContext;
  after: SimpleResponseContext;
}

export interface SimpleResponseInterceptor {
  (ctx: SimpleResponseContext): Promise<SimpleResponseContext>;
}

export interface DebugRecord {
  key: string;
  id: string;
  request?: SimpleRequestContext;
  response?: SimpleResponseContext;
}
