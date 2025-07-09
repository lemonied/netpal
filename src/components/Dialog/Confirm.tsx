import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import React from 'react';
import { createRoot } from 'react-dom/client';

interface ConfirmContentProps {
  title?: React.ReactNode;
  content?: React.ReactNode;
  onConfirm?: (confirm: boolean) => void;
  afterClose?: () => void;
}
const ConfirmContent = (props: ConfirmContentProps) => {

  const { title, content, onConfirm, afterClose } = props;

  const [state, setState] = React.useState(true);

  const close = (confirm: boolean) => {
    setState(false);
    onConfirm?.(confirm);
  };

  return (
    <Dialog
      open={state}
      slotProps={{
        transition: {
          onExited() {
            window.setTimeout(() => {
              afterClose?.();
            });
          },
        },
      }}
      onClose={() => {
        close(false);
      }}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        <Box
          sx={{
            width: 260,
          }}
        >{content}</Box>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            close(false);
          }}>取消</Button>
        <Button
          onClick={() => {
            close(true);
          }}
        >确认</Button>
      </DialogActions>
    </Dialog>
  );
};

export const createConfirm = (options: Pick<ConfirmContentProps, 'title' | 'content'>) => {
  return new Promise<boolean>((resolve) => {
    const div = document.createElement('div');
    document.body.appendChild(div);
    const root = createRoot(div);
    root.render(
      <ConfirmContent
        {...options}
        onConfirm={resolve}
        afterClose={() => {
          root.unmount();
          document.body.removeChild(div);
        }}
      />,
    );
  });
};
