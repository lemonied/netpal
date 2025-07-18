import React from 'react';
import { IS_CHROME_EXTENSION, isBridgeMessage, isMatchType, MESSAGE_REPLY_SUFFIX, portListener } from '@/utils';

let sidePanelPort: chrome.runtime.Port | undefined = undefined;
const portChange: (() => void)[] = [];

function initSidePanelPort() {
  sidePanelPort = chrome.runtime.connect({ name: 'sidePanelStat' });
  // eslint-disable-next-line no-console
  console.log('side panel connected');
  portListener({
    onDisconnect() {
      window.setTimeout(initSidePanelPort, 1000);
    },
  }, sidePanelPort);
  window.addEventListener('beforeunload', () => {
    sidePanelPort?.disconnect();
  });
  portChange.forEach(fn => fn());
}

if (IS_CHROME_EXTENSION) {
  initSidePanelPort();
}

export const useSidePort = () => {
  const [state, setState] = React.useState(sidePanelPort);

  React.useEffect(() => {
    const onPortChange = () => {
      setState(sidePanelPort);
    };
    portChange.push(onPortChange);

    return () => {
      const index = portChange.indexOf(onPortChange);
      if (index > -1) {
        portChange.splice(index, 1);
      }
    };
  }, []);

  return state;

};

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
