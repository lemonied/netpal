import React from 'react';
import { isBridgeMessage, isMatchType } from '@/utils';

interface Listener<T=any> {
  (message: T, sender: chrome.runtime.MessageSender, sendResponse: (data?: any, error?: string) => void): boolean | void;
};

export const useRuntimeMessageListener = <T=any>(type: string, listener: Listener<T>) => {

  const listenerRef = React.useRef(listener);
  listenerRef.current = listener;

  React.useEffect(() => {
    const cb = (message: any, sender: chrome.runtime.MessageSender, _sendResponse: (response?: any) => void) => {
      if (isBridgeMessage(message) && isMatchType(message, type)) {
        const sendResponse = (data?: any, error?: string) => {
          _sendResponse({
            error,
            data,
          });
        };
        return listenerRef.current(message.data, sender, sendResponse);
      }
    };
    chrome.runtime.onMessage.addListener(cb);

    return () => {
      chrome.runtime.onMessage.removeListener(cb);
    };
  }, [type]);

};
