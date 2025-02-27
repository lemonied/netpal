import React from 'react';
import FloatingAction from '../FloatingAction';
import Interceptors from '../Interceptors';
import ResizableDrawer from '../ResizableDrawer';
import { Box, Tab, Tabs, Grid2 as Grid, IconButton } from '@mui/material';
import { DeleteOutline } from '@mui/icons-material';
import Form from 'form-pilot';

const RootEntry = () => {

  const [open, setOpen] = React.useState(false);
  const control = Form.useControl();

  return (
    <>
      {
        open && (
          <ResizableDrawer
            height={500}
          >
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Grid
                container
                direction="row"
                sx={{
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'nowrap',
                }}
              >
                <Form.Item
                  control={control}
                  initialValue={0}
                  getValueFromEvent={(_, value) => value}
                >
                  <Tabs>
                    <Tab label="xhr/fetch拦截器" value={0} />
                    <Tab label="Item Two" value={1} />
                    <Tab label="Item Three" value={2} />
                  </Tabs>
                </Form.Item>
                <Box>
                  <IconButton
                    onClick={() => setOpen(false)}
                  >
                    <DeleteOutline />
                  </IconButton>
                </Box>
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
          </ResizableDrawer>
        )
      }
      {
        !open && (
          <FloatingAction
            onClick={() => {
              setOpen(pre => !pre);
            }}
          />
        )
      }
    </>
  );

};

export default RootEntry;
