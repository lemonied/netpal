import Form from 'form-pilot';
import { FocusBorder } from '../FocusBorder';
import { Box, Paper, Stack, TextField, Typography } from '@mui/material';
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
        <Form.Item
          name="regex"
        >
          <TextField label="路径(正则表达式)" variant="outlined" />
        </Form.Item>
        <Paper elevation={0}>
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
        </Paper>
        <Paper elevation={0}>
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
        </Paper>
      </Stack>
    </Box>
  );
};

export default Item;
