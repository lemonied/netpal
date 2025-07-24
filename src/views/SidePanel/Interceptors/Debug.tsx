import React from 'react';
import { useRuntimeMessageListener } from '@/hooks';
import Form from 'form-pilot';
import { Dialog } from '@mui/material';
import type { DebugRecord } from './util';

const DebugContent = () => {

  const key = Form.useWatch(['key']);

  useRuntimeMessageListener<DebugRecord>('debug', (message, _, sendResponse) => {
    if (key === message.key) {
      sendResponse(undefined);
      return true;
    }
  });

  return (
    <></>
  );
};

export const Debug = () => {

  const [open] = React.useState(false);

  return (
    <Dialog
      open={open}
    >
      <DebugContent />
    </Dialog>
  );
};
