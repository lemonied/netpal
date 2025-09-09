import React from 'react';
import {
  AppBar,
  Box,
  Button,
  Dialog,
  FormControlLabel,
  Slide,
  Switch,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import type { SimpleRequestContext, SimpleResponseContext } from '../utils';
import { safeParse } from '../utils';
import { buildMessage, isBridgeMessage, isMatchType, MESSAGE_REPLY_SUFFIX } from '@/utils';
import type { TransitionProps } from '@mui/material/transitions';
import Form from 'form-pilot';
import CodeEditor from '@/components/CodeEditor';
import { useConfig } from '../Context';
import { useRuntimeMessageListener } from '@/hooks';

interface TProps extends TransitionProps {
  children: React.ReactElement<unknown>;
  ref?: React.Ref<unknown>;
}
const Transition = (props: TProps) => {
  return (
    <Slide
      {...props}
      direction="up"
    />
  );
};

interface DebugContentProps {
  data?: SimpleRequestContext | SimpleResponseContext;
  onFinish?: (data: SimpleRequestContext | SimpleResponseContext) => void;
}
const DebugContent = (props: DebugContentProps) => {

  const { data, onFinish } = props;
  const control = Form.useControl();

  const { config, setConfig } = useConfig();

  const initialValue = React.useMemo(() => {
    const mergedData = {
      ...data,
      body: safeParse(data?.body),
    };
    return JSON.stringify(mergedData, null, 2);
  }, [data]);
  const handleFinish = () => {
    const value = JSON.parse(control.getValue());
    if (typeof value.body !== 'string') {
      value.body = JSON.stringify(value.body);
    }
    onFinish?.(value);
  };

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <AppBar
        sx={{
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Toolbar>
          <Typography
            sx={{ ml: 2, flex: 1 }}
            variant="h6"
            component="div"
          >{data?.type}</Typography>
          <Tooltip
            title={
              config.enableDebug ? '开启Debug' : '关闭Debug'
            }
            placement="left"
          >
            <Switch
              checked={config.enableDebug}
              color="secondary"
              onChange={e => {
                setConfig?.(pre => {
                  return {
                    ...pre,
                    enableDebug: e.target.checked,
                  };
                });
              }}
            />
          </Tooltip>
          <Button
            color="inherit"
            onClick={handleFinish}
          >下一步</Button>
        </Toolbar>
      </AppBar>
      <Box
        sx={{
          flex: 1,
        }}
      >
        <Form.Item
          control={control}
          initialValue={initialValue}
        >
          <CodeEditor
            language="json"
            options={{
              tabSize: 2,
              minimap: {
                enabled: true,
              },
              scrollbar: {
                arrowSize: 3,
              },
            }}
          />
        </Form.Item>
      </Box>
    </Box>
  );
};

interface DebugProps {
  sendToSanbox: (data: any) => void;
}
export const Debug = (props: DebugProps) => {

  const { sendToSanbox } = props;
  const sendToSanboxRef = React.useRef(sendToSanbox);
  sendToSanboxRef.current = sendToSanbox;

  const { config } = useConfig();
  const enableDebug = React.useRef(config.enableDebug);
  enableDebug.current = config.enableDebug;

  const [data, setData] = React.useState<SimpleRequestContext | SimpleResponseContext>();
  const resolved = React.useRef<(value: SimpleRequestContext | SimpleResponseContext) => void>(null);

  const debugQueueRef = React.useRef<Promise<void>[]>([]);

  const fnRef = React.useRef(async (data: any) => {
    const debugQueue = debugQueueRef.current;
    await Promise.all(debugQueue);
    let nextData = data;
    if (enableDebug.current) {
      setData(data);
      const promise = new Promise<SimpleRequestContext | SimpleResponseContext>((resolve) => {
        resolved.current = resolve;
      }).then(res => {
        nextData = res;
      });
      debugQueue.push(promise);
      await promise;
      const index = debugQueue.indexOf(promise);
      if (index > -1) {
        debugQueue.splice(index, 1);
      }
    }
    return nextData;
  });


  React.useEffect(() => {
    const listener = async (e: MessageEvent) => {
      const message = e.data;
      if (isBridgeMessage(message) && isMatchType(message, 'debug')) {
        const nextData = await fnRef.current(message.data);
        sendToSanboxRef.current(
          buildMessage({
            ...message,
            type: `${message.type}${MESSAGE_REPLY_SUFFIX}`,
            data: nextData,
          }),
        );
      }
    };

    window.addEventListener('message', listener);

    return () => {
      window.removeEventListener('message', listener);
    };
  }, []);

  useRuntimeMessageListener('debug', (data, _, sendResponse) => {
    (async () => {
      try {
        const nextData = await fnRef.current(data);
        sendResponse(nextData);
      } catch (e) {
        sendResponse(undefined, `${e}`);
      }
    })();
    return true;
  });

  return (
    <Dialog
      fullScreen
      open={!!data}
      slots={{
        transition: Transition,
      }}
    >
      <DebugContent
        data={data}
        onFinish={(value) => {
          setData(undefined);
          resolved.current?.(value);
        }}
      />
    </Dialog>
  );
};

export const DebugSwitch = () => {

  const { config, setConfig } = useConfig();

  return (
    <FormControlLabel
      labelPlacement="start"
      control={
        <Switch
          checked={config.enableDebug}
          onChange={e => {
            setConfig?.(pre => {
              return {
                ...pre,
                enableDebug: e.target.checked,
              };
            });
          }}
        />
      }
      label="Debug"
    />
  );
};
