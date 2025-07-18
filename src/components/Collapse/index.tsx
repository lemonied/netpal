import React from 'react';
import { Collapse as MCollapse, Stack, Box, IconButton } from '@mui/material';
import type { CollapseProps as MCollapseProps } from '@mui/material';
import { KeyboardArrowUp, KeyboardArrowDown } from '@mui/icons-material';

interface CollapseProps extends Omit<MCollapseProps, 'open' | 'title'> {
  defaultOpen?: boolean;
  title: React.ReactNode;
}
const Collapse = (props: CollapseProps) => {

  const { defaultOpen, title, ...restProps } = props;

  const [state, setState] = React.useState(defaultOpen);

  return (
    <Stack spacing={2}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <IconButton
          size="small"
          onClick={() => setState(pre => !pre)}
        >
          {
            state ?
              <KeyboardArrowUp /> :
              <KeyboardArrowDown />
          }
        </IconButton>
        {title}
      </Box>
      <MCollapse
        {...restProps}
        in={state}
      />
    </Stack>
  );
};

export default Collapse;
