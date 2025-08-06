import React from 'react';
import Interceptors from './Interceptors';
import { Box, Tab, Tabs, Grid, styled } from '@mui/material';
import Form from 'form-pilot';
import { buildMessage, isBridgeMessage, randomStr } from '@/utils';
import { useRuntimeMessageListener } from '@/hooks';
import { Debug, DebugSwitch } from './Interceptors/Debug';
import { ConfigProvider } from './Context';
import Records, { RecordsProvider } from './Records';

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

const Iframe = styled('iframe')`
  width: 0;
  height: 0;
  opacity: 0;
  position: fixed;
  top: 0;
  left: 0;
  overflow: hidden;
`;

const SidePanel = () => {

  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  const control = Form.useControl();

  useRuntimeMessageListener('evaluate-script', (message, _, sendResponse) => {
    const key = randomStr('eval');
    const listener = (e: MessageEvent) => {
      const message = e.data;
      if (isBridgeMessage(message) && message.key === key) {
        sendResponse(message.data, message.error);
        window.removeEventListener('message', listener);
      }
    };
    window.addEventListener('message', listener);
    iframeRef.current?.contentWindow?.postMessage(
      buildMessage({
        type: 'evaluate-script',
        key,
        data: message,
      }),
      '*',
    );
    return true;
  });

  return (
    <ConfigProvider>
      <Box
        sx={{
          minWidth: 500,
          overflowX: 'auto',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
        }}
      >
        <Box
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'space-between',
            padding: '0 8px 0 0',
          }}
        >
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
                <Tab label="拦截记录" value={1} />
              </Tabs>
            </Form.Item>
          </Grid>
          <DebugSwitch />
        </Box>
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
          }}
        >
          <RecordsProvider>
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
                  if (value === 1) {
                    return (
                      <Records />
                    );
                  }
                  return null;
                }
              }
            </Form.Update>
          </RecordsProvider>
        </Box>
      </Box>
      <Debug sanbox={iframeRef} />
      <Iframe ref={iframeRef} src={iframeSrc} />
    </ConfigProvider>
  );

};

export default SidePanel;
