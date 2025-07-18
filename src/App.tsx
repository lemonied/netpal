import React from 'react';
import SidePanel from './views/SidePanel';
import { IS_CHROME_EXTENSION, portListener } from '@/utils';
import { createTheme, ThemeProvider } from '@mui/material';
import { getSidePanelPort, useSidePort } from './views/SidePanel/Interceptors';

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
  const port = useSidePort();

  React.useEffect(() => {

    const listener = (e: MessageEvent) => {
      getSidePanelPort()?.postMessage(e.data);
    };
    window.addEventListener('message', listener);

    return () => {
      window.removeEventListener('message', listener);
    };
  }, []);

  React.useEffect(() => {
    return portListener({
      onMessage(message) {
        iframeRef.current?.contentWindow?.postMessage(message, '*');
      },
    }, port);
  }, [port]);

  return (
    <>
      <ThemeProvider theme={theme}>
        <SidePanel />
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
