import Form from 'form-pilot';
import { FocusBorder } from '../FocusBorder';
import { Box, Stack, Switch, TextField, Typography } from '@mui/material';
import { ContextEditor } from './Editor';

const Item = () => {
  return (
    <Box
      sx={{
        padding: 2,
      }}
    >
      <Stack
        spacing={2}
      >
        <Stack
          direction="row"
          alignItems="center"
        >
          <Box
            sx={{
              flex: 1,
            }}
          >
            <Form.Item
              name="regex"
            >
              <TextField label="路径(正则表达式)" variant="outlined" fullWidth />
            </Form.Item>
          </Box>
          <Stack
            direction="row"
            alignItems="center"
            sx={{
              flex: '0 0 150px',
              width: 150,
            }}
          >
            <Form.Item
              name="enabled"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            <Form.Update
              condition={(newValue, oldValue) => {
                return newValue.enabled !== oldValue.enabled;
              }}
            >
              {
                (ctl) => {
                  return (
                    <Typography>{ctl?.getValue()?.enabled ? '启用' : '禁用'}</Typography>
                  );
                }
              }
            </Form.Update>
          </Stack>
        </Stack>
        <Box>
          <Typography
            gutterBottom
            sx={{
              color: 'text-secondary',
              fontSize: 14,
            }}
          >请求拦截器</Typography>
          <FocusBorder
            style={{
              padding: '10px 6px',
            }}
          >
            <Form.Item
              name="request"
            >
              <ContextEditor />
            </Form.Item>
          </FocusBorder>
        </Box>
        <Box>
          <Typography
            gutterBottom
            sx={{
              color: 'text-secondary',
              fontSize: 14,
            }}
          >响应拦截器</Typography>
          <FocusBorder
            style={{
              padding: '10px 6px',
            }}
          >
            <Form.Item
              name="response"
            >
              <ContextEditor />
            </Form.Item>
          </FocusBorder>
        </Box>
      </Stack>
    </Box>
  );
};

export default Item;
