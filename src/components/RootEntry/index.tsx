import Interceptors from '../Interceptors';
import { Box, Tab, Tabs, Grid2 as Grid } from '@mui/material';
import Form from 'form-pilot';

const RootEntry = () => {

  const control = Form.useControl();

  return (
    <>
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
              <Tab label="Item Two" value={1} />
              <Tab label="Item Three" value={2} />
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
    </>
  );

};

export default RootEntry;
