import Interceptors from '../Interceptors';
import { Box, Tab, Tabs, Grid, styled } from '@mui/material';
import Form from 'form-pilot';

const RootWrapper = styled(Box)`
  min-width: 500px;
  overflow: auto;
`;

const RootEntry = () => {

  const control = Form.useControl();

  return (
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
  );

};

export default RootEntry;
