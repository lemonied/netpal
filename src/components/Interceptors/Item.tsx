import React from 'react';
import Form from 'form-pilot';
import { FocusBorder } from '../FocusBorder';
import { Box, Stack, Switch, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { ContextEditor } from './Editor';
import { useMessageListener } from './sidePanelPort';

const Item = () => {

  const [records, setRecords] = React.useState<any[]>([]);

  const control = Form.useControlInstance();

  useMessageListener('intercept-records', (data) => {
    if (data.key === control?.getValue()?.key) {
      setRecords(pre => [data, ...pre]);
    }
  });

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
        <Box>
          <Typography
            gutterBottom
            sx={{
              color: 'text-secondary',
              fontSize: 14,
            }}
          >拦截记录</Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>类型</TableCell>
                <TableCell>时间</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {
                records.map((record, index) => {
                  return (
                    <TableRow key={index}>
                      <TableCell>{record.type}</TableCell>
                      <TableCell>{new Date(record.timestamp).toLocaleString()}</TableCell>
                    </TableRow>
                  );
                })
              }
            </TableBody>
          </Table>
        </Box>
      </Stack>
    </Box>
  );
};

export default Item;
