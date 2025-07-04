import React from 'react';
import RootEntry from '@/components/RootEntry';
import { IS_CHROME_EXTENSION } from '@/utils';
import { createTheme, ThemeProvider } from '@mui/material';

const port = IS_CHROME_EXTENSION ? chrome.runtime.connect({ name: 'sidePanelStat' }) : undefined;
const iframeSrc = IS_CHROME_EXTENSION ? chrome.runtime.getURL('extensions/sandbox/index.html') : undefined;

const theme = createTheme({
  components: {
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

function App() {

  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  React.useEffect(() => {

    const listener = (message: any) => {
      iframeRef.current?.contentWindow?.postMessage(message, '*');
    };
    port?.onMessage.addListener(listener);

    const windowListener = (e: MessageEvent) => {
      port?.postMessage(e.data);
    };
    window.addEventListener('message', windowListener);

    return () => {
      port?.onMessage.removeListener(listener);
      window.removeEventListener('message', windowListener);
    };
  }, []);

  return (
    <>
      <ThemeProvider theme={theme}>
        <RootEntry />
      </ThemeProvider>
      {
        IS_CHROME_EXTENSION && (
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
        )
      }
    </>
  );
}

export default App;
