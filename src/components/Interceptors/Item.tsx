import Editor from '@/components/CodeEditor';
import Form from 'form-pilot';
import { FocusBorder } from '../FocusBorder';
import { Card, CardContent, Stack, Typography } from '@mui/material';

const Item = () => {
  return (
    <div style={{ padding: 8 }}>
      <Stack
        spacing={1}
      >
        <Card>
          <CardContent>
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
                <Editor
                  language="javascript"
                  height={200}
                  options={{
                    tabSize: 2,
                  }}
                />
              </Form.Item>
            </FocusBorder>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
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
                <Editor
                  language="javascript"
                  height={200}
                  options={{
                    tabSize: 2,
                  }}
                />
              </Form.Item>
            </FocusBorder>
          </CardContent>
        </Card>
      </Stack>
    </div>
  );
};

export default Item;
