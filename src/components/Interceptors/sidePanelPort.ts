import React from 'react';
import { IS_CHROME_EXTENSION, isBridgeMessage, isMatchType, MESSAGE_REPLY_SUFFIX } from '@/utils';

let sidePanelPort: chrome.runtime.Port | undefined = undefined;

function initSidePanelPort() {
  sidePanelPort = chrome.runtime.connect({ name: 'sidePanelStat' });
  // eslint-disable-next-line no-console
  console.log('side panel connected');
  sidePanelPort.onDisconnect.addListener(() => {
    window.setTimeout(initSidePanelPort, 1000);
  });
  window.addEventListener('beforeunload', () => {
    sidePanelPort?.disconnect();
  });
}

if (IS_CHROME_EXTENSION) {
  initSidePanelPort();
}

export const getSidePanelPort = () => sidePanelPort;

export const useMessageListener = <T = any, R = any>(type: string, listener: (message: T, reply: (data: R) => void) => void) => {

  const typeRef = React.useRef(type);
  typeRef.current = type;

  const listenerRef = React.useRef(listener);
  listenerRef.current = listener;

  React.useEffect(() => {

    const cb = (message: any) => {
      if (isBridgeMessage(message) && isMatchType(message, typeRef.current)) {
        listenerRef.current(message.data, (data) => {
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
