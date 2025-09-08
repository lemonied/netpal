import Form from 'form-pilot';
import { FocusBorder } from '@/components/FocusBorder';
import Collapse from '@/components/Collapse';
import { Box, Stack, Switch, TextField, Typography } from '@mui/material';
import { CtxEditor } from './CtxEditor';
import { Files } from './Files';

const Item = () => {

  return (
    <Box
      sx={{
        padding: 2,
      }}
    >
      <Stack spacing={1}>
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
            <Form.Item
              name="enabled"
            >
              {
                (p) => {
                  return (
                    <Typography>{p.value ? '启用' : '禁用'}</Typography>
                  );
                }
              }
            </Form.Item>
          </Stack>
        </Stack>
        <Collapse
          title={
            <Typography>请求拦截器</Typography>
          }
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
            }}
          >
            <Files name="requestFiles" />
            <FocusBorder
              style={{
                padding: '10px 6px',
              }}
            >
              <Form.Item
                name="request"
              >
                <CtxEditor
                  path="sandbox-ctx.js"
                />
              </Form.Item>
            </FocusBorder>
          </Box>
        </Collapse>
        <Collapse
          title={
            <Typography>响应拦截器</Typography>
          }
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
            }}
          >
            <Files name="responseFiles" />
            <FocusBorder
              style={{
                padding: '10px 6px',
              }}
            >
              <Form.Item
                name="response"
              >
                <CtxEditor
                  path="sandbox-ctx.js"
                />
              </Form.Item>
            </FocusBorder>
          </Box>
        </Collapse>
      </Stack>
    </Box>
  );
};

export default Item;
