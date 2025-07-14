import React from 'react';
import { IS_CHROME_EXTENSION, isBridgeMessage, isMatchType, MESSAGE_REPLY_SUFFIX } from '@/utils';
import type { BridgeMessage } from '@/utils';

export const sidePanelPort = IS_CHROME_EXTENSION ? chrome.runtime.connect({ name: 'sidePanelStat' }) : undefined;

export const useMessageListener = <T=any, R=any>(type: string, listener: (message: BridgeMessage<T>, reply: (data: R) => void) => void) => {

  const typeRef = React.useRef(type);
  typeRef.current = type;

  const listenerRef = React.useRef(listener);
  listenerRef.current = listener;

  React.useEffect(() => {
  
    const cb = (message: any) => {
      if (isBridgeMessage(message) && isMatchType(message, typeRef.current)) {
        listenerRef.current(message, (data) => {
          sidePanelPort?.postMessage({
            ...message,
            type: `${message.key}${MESSAGE_REPLY_SUFFIX}`,
            data,
          });
        });
      }
    };
    sidePanelPort?.onMessage.addListener(cb);

    return () => {
      sidePanelPort?.onMessage.removeListener(cb);
    };
  }, []);
};
