import React from 'react';
import Form from 'form-pilot';
import {
  Box,
  Collapse as MCollapse,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { usePortMessageListener } from './sidePanelPort';
import type { RequestRecord, ResponseRecord } from './util';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { DiffEditor } from '@/components/CodeEditor';
import Collapse from '@/components/Collapse';

function safeParse(str?: string) {
  try {
    return JSON.parse(str!);
  } catch {
    return str;
  }
}

interface RecordState {
  id: string;
  request?: RequestRecord;
  response?: ResponseRecord;
}

interface RowProps {
  record: RecordState;
}
const Row = (props: RowProps) => {

  const { record } = props;
  const [open, setOpen] = React.useState(false);

  const requestDiff = React.useMemo(() => {
    return {
      original: JSON.stringify({
        ...record.request?.before,
        body: safeParse(record.request?.before.body),
      }, null, 2),
      modified: JSON.stringify({
        ...record.request?.after,
        body: safeParse(record.request?.after.body),
      }, null, 2),
    };
  }, [record]);

  const responseDiff = React.useMemo(() => {
    return {
      original: JSON.stringify({
        body: safeParse(record.response?.before.body),
        timestamp: record.response?.before.timestamp,
      }, null, 2),
      modified: JSON.stringify({
        body: safeParse(record.response?.after.body),
        timestamp: record.response?.after.timestamp,
      }, null, 2),
    };
  }, [record]);

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset !important' } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(pre => !pre)}
          >
            {
              open ?
                <KeyboardArrowUp /> :
                <KeyboardArrowDown />
            }
          </IconButton>
        </TableCell>
        <TableCell>{record.request?.after.url}</TableCell>
        <TableCell>
          {
            record.response ?
              record.response.after.status :
              'pending'
          }
        </TableCell>
        <TableCell>
          {
            typeof record.request?.before.timestamp === 'number' ?
              new Date(record.request.before.timestamp).toLocaleString() :
              '-'
          }
        </TableCell>
        <TableCell>
          {
            typeof record.response?.after.timestamp === 'number' ?
              new Date(record.response.after.timestamp).toLocaleString() :
              '-'
          }
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <MCollapse in={open} timeout="auto" unmountOnExit>
            <Box
              sx={{ margin: 1 }}
            >
              <Stack gap={1}>
                <Box>
                  <Typography variant="h6" gutterBottom component="div">Request</Typography>
                  <DiffEditor
                    original={requestDiff.original}
                    modified={requestDiff.modified}
                    language="json"
                    options={{
                      readOnly: true,
                      renderSideBySide: true,
                      minimap: {
                        enabled: false,
                      },
                      scrollbar: {
                        arrowSize: 3,
                      },
                    }}
                    height={200}
                  />
                </Box>
                <Box>
                  <Typography variant="h6" gutterBottom component="div">Response</Typography>
                  <DiffEditor
                    original={responseDiff.original}
                    modified={responseDiff.modified}
                    language="json"
                    options={{
                      readOnly: true,
                      renderSideBySide: true,
                      minimap: {
                        enabled: false,
                      },
                      scrollbar: {
                        arrowSize: 3,
                      },
                    }}
                    height={200}
                  />
                </Box>
              </Stack>
            </Box>
          </MCollapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const Records = () => {

  const [records, setRecords] = React.useState<RecordState[]>([]);

  const control = Form.useControlInstance();

  usePortMessageListener<RequestRecord | ResponseRecord>('intercept-records', (data) => {
    if (data.key === control?.getValue()?.key) {
      setRecords(pre => {
        const index = pre.findIndex(v => v.id === data.id);
        if (index > -1) {
          const item = pre[index];
          const ret = pre.slice();
          ret.splice(index, 1, {
            ...item,
            [data.type]: data,
          });
          return ret;
        }
        return [
          {
            id: data.id,
            [data.type]: data,
          },
          ...pre,
        ];
      });
    }
  });

  return (
    <Collapse
      title={
        <Typography>拦截记录</Typography>
      }
    >
      <Table>
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>URL</TableCell>
            <TableCell>状态</TableCell>
            <TableCell>开始时间</TableCell>
            <TableCell>结束时间</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {
            records.map((record, index) => {
              return (
                <Row key={index} record={record} />
              );
            })
          }
        </TableBody>
      </Table>
    </Collapse>
  );
};

export { Records };
