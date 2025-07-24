import React from 'react';
import Form from 'form-pilot';
import {
  Box,
  Collapse as MCollapse,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Tooltip,
  TableContainer,
  Paper,
} from '@mui/material';
import type { RequestRecord, ResponseRecord } from './util';
import { DeleteOutline, FolderOpen, KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { EditorContainer, DiffEditor } from '@/components/CodeEditor';
import Collapse from '@/components/Collapse';
import { useRecords } from './Context';
import { FocusBorder } from '@/components/FocusBorder';

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
  column: number;
}
const Row = (props: RowProps) => {

  const { record, column } = props;
  const [open, setOpen] = React.useState(false);

  const diff = React.useMemo(() => {
    return {
      original: JSON.stringify({
        request: {
          ...record.request?.before,
          body: safeParse(record.request?.before.body),
        },
        response: {
          body: safeParse(record.response?.before.body),
          timestamp: record.response?.before.timestamp,
        },
      }, null, 2),
      modified: JSON.stringify({
        request: {
          ...record.request?.after,
          body: safeParse(record.request?.after.body),
        },
        response: {
          body: safeParse(record.response?.after.body),
          timestamp: record.response?.after.timestamp,
        },
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
        <TableCell>
          <Typography
            sx={{
              maxWidth: 390,
              wordBreak: 'break-all',
            }}
          >{record.request?.after.url}</Typography>
        </TableCell>
        <TableCell>{record.request?.initiator}</TableCell>
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
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={column}>
          <MCollapse in={open} timeout="auto" unmountOnExit>
            <Box
              sx={{ margin: 1 }}
            >
              <Typography variant="h6" gutterBottom component="div">Diff</Typography>
              <FocusBorder
                style={{
                  padding: '10px 6px',
                }}
              >
                <EditorContainer max={600}>
                  <DiffEditor
                    original={diff.original}
                    modified={diff.modified}
                    language="json"
                    keepCurrentModifiedModel
                    keepCurrentOriginalModel
                    options={{
                      readOnly: true,
                      renderSideBySide: true,
                      minimap: {
                        enabled: false,
                      },
                      scrollbar: {
                        arrowSize: 3,
                        alwaysConsumeMouseWheel: false,
                      },
                    }}
                  />
                </EditorContainer>
              </FocusBorder>
            </Box>
          </MCollapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const Records = () => {

  const key = Form.useWatch(['key']);
  const { records, clear } = useRecords(key);

  const headers = [
    <TableCell />,
    <TableCell>URL</TableCell>,
    <TableCell>类型</TableCell>,
    <TableCell>状态</TableCell>,
    <TableCell>开始时间</TableCell>,
    <TableCell>结束时间</TableCell>,
  ];

  return (
    <Collapse
      title={
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography>拦截记录</Typography>
          <Tooltip
            title="Clear"
            arrow
            placement="left"
          >
            <IconButton
              aria-label="clear"
              size="small"
              onClick={() => clear()}
              color="error"
            >
              <DeleteOutline />
            </IconButton>
          </Tooltip>
        </Box>
      }
    >
      <TableContainer
        component={Paper}
        sx={{
          maxHeight: '100vh',
        }}
      >
        <Table
          size="small"
          stickyHeader
        >
          <TableHead>
            <TableRow>
              {
                headers.map((cell, index) => {
                  return React.cloneElement(cell, { key: index });
                })
              }
            </TableRow>
          </TableHead>
          <TableBody>
            {
              records.map((record) => {
                return (
                  <Row
                    key={record.id}
                    record={record}
                    column={headers.length}
                  />
                );
              })
            }
            {
              !records.length && (
                <TableRow>
                  <TableCell colSpan={headers.length}>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <FolderOpen fontSize="large" />
                      <Typography>No Data</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )
            }
          </TableBody>
        </Table>
      </TableContainer>
    </Collapse>
  );
};

export { Records };
