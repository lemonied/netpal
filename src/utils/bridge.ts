export const MESSAGE_TYPE_PREFIX = 'netpal-';

export const MESSAGE_REPLY_SUFFIX = '-reply';

export const NETPAL_EVENT_NAME = 'NetpalEvent';

export const NETPAL_RUNTIME_EVENT_NAME = 'NetpalRuntimeEvent';

export interface BridgeMessage<T = any> {
  type: string;
  key: string;
  data?: T;
  error?: string;
}

export function buildMessage<T = any>(message: BridgeMessage<T>) {
  return {
    ...message,
    type: `${MESSAGE_TYPE_PREFIX}${message.type}`,
  } satisfies BridgeMessage<T>;
}

export function isBridgeMessage(val: unknown): val is BridgeMessage {
  return val && typeof (val as any).type === 'string' && (val as any).type.startsWith(MESSAGE_TYPE_PREFIX);
}

export function isMatchType<T extends BridgeMessage>(message: T, type: string) {
  return message.type === `${MESSAGE_TYPE_PREFIX}${type}`;
}

export function isMatchReply<T extends BridgeMessage>(message: T, type: string) {
  return message.type === `${MESSAGE_TYPE_PREFIX}${type}${MESSAGE_REPLY_SUFFIX}`;
}
