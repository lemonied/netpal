import React from 'react';
import RootEntry from '@/components/RootEntry';

const port = chrome.runtime?.connect?.({ name: 'sidePanelStat' });
const iframeSrc = chrome.runtime?.getURL('extensions/sandbox/index.html');

function App() {

  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  React.useEffect(() => {

    const listener = (message: any) => {
      iframeRef.current?.contentWindow?.postMessage(message, '*');
    };
    port.onMessage.addListener(listener);

    const windowListener = (e: MessageEvent) => {
      port?.postMessage(e.data);
    };
    window.addEventListener('message', windowListener);

    return () => {
      port.onMessage.removeListener(listener);
      window.removeEventListener('message', windowListener);
    };
  }, []);

  return (
    <>
      <RootEntry />
      <iframe
        ref={iframeRef}
        src={iframeSrc}
        style={{
          width: 0,
          height: 0,
          opacity: 0,
          position: 'fixed',
          top: 0,
          left: 0,
          overflow: 'hidden',
        }}
      />
    </>
  );
}

export default App;
