import React from 'react';
import Interceptors from './Interceptors';
import { Box, Tab, Tabs, Grid, styled } from '@mui/material';
import Form from 'form-pilot';
import { randomStr } from '@/utils';
import { useRuntimeMessageListener } from '@/hooks';

const iframeSrc = chrome.runtime.getURL('extensions/sandbox/index.html');

async function initSidePanelPort() {
  const windowId = (await chrome.windows.getCurrent()).id;
  if (typeof windowId !== 'number') return;
  const port = chrome.runtime.connect({ name: `sidePanelStat_${windowId}` });
  port.onDisconnect.addListener(() => {
    window.setTimeout(initSidePanelPort, 1000);
  });
}
initSidePanelPort();

const RootWrapper = styled(Box)`
  min-width: 500px;
  overflow: auto;
`;

const SidePanel = () => {

  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  const control = Form.useControl();

  useRuntimeMessageListener('evaluate-script', (message, _, sendResponse) => {
    const key = randomStr('eval');
    const listener = (e: MessageEvent) => {
      const message = e.data;
      if (message.key === key) {
        sendResponse(message.data, message.error);
        window.removeEventListener('message', listener);
      }
    };
    window.addEventListener('message', listener);
    iframeRef.current?.contentWindow?.postMessage({
      key,
      script: message,
    }, '*');
    return true;
  });

  return (
    <>
      <RootWrapper>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Grid
            container
            direction="row"
          >
            <Form.Item
              control={control}
              initialValue={0}
              getValueFromEvent={(_, value) => value}
            >
              <Tabs>
                <Tab label="xhr/fetch拦截器" value={0} />
              </Tabs>
            </Form.Item>
          </Grid>
        </Box>
        <Box>
          <Form.Update
            control={control}
          >
            {
              (control) => {
                const value = control?.getValue();
                if (value === 0) {
                  return (
                    <Interceptors />
                  );
                }
                return null;
              }
            }
          </Form.Update>
        </Box>
      </RootWrapper>
      {
        iframeSrc && (
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

};

export default SidePanel;
