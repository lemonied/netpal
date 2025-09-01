import React from 'react';
import { Collapse as MCollapse, Stack, Box, IconButton, Typography } from '@mui/material';
import type { CollapseProps as MCollapseProps } from '@mui/material';
import { KeyboardArrowUp, KeyboardArrowDown } from '@mui/icons-material';

interface CollapseProps extends Omit<MCollapseProps, 'in' | 'title'> {
  defaultOpen?: boolean;
  title?: React.ReactNode;
}
const Collapse = (props: CollapseProps) => {

  const { defaultOpen = true, title, ...restProps } = props;

  const [state, setState] = React.useState(defaultOpen);

  return (
    <Stack spacing={1}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: '2px',
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
        <Typography
          sx={{
            ':hover': {
              cursor: 'pointer',
            },
          }}
          onClick={() => setState(pre => !pre)}
        >{title}</Typography>
      </Box>
      <MCollapse
        {...restProps}
        in={state}
      />
    </Stack>
  );
};

export default Collapse;
