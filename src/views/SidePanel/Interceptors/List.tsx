import React from 'react';
import Form from 'form-pilot';
import Item from './Item';
import { Box, Chip, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { DEFAULT_REQUEST_INTERCEPTOR, DEFAULT_RESPONSE_INTERCEPTOR } from './util';
import type { RequestRecord, ResponseRecord } from './util';
import { debounce } from 'lodash';
import { buildMessage, getCurrentTab, getInterceptors, randomStr, saveInterceptor } from '@/utils';
import { Add } from '@mui/icons-material';
import { createConfirm } from '@/components/Dialog';
import { useRuntimeMessageListener } from '@/hooks';
import type { RecordState } from './Context';
import { RecordsContext } from './Context';

const debounceSave = debounce(async (value: any) => {
  await saveInterceptor(value);
  const tab = await getCurrentTab();
  const tabId = tab.id;
  if (typeof tabId === 'number') {
    chrome.tabs.sendMessage(tabId, buildMessage({
      type: 'interceptors-reload',
      key: randomStr('interceptors-reload'),
      data: await getInterceptors(),
    }));
  }

}, 200);

const generateDefaultItem = () => {
  return {
    key: randomStr('item'),
    regex: '.*',
    request: DEFAULT_REQUEST_INTERCEPTOR,
    response: DEFAULT_RESPONSE_INTERCEPTOR,
    enabled: true,
  };
};

const Interceptors = () => {

  const [tab, setTab] = React.useState(0);
  const control = Form.useControl();
  const [records, setRecords] = React.useState<RecordState[]>([]);

  Form.useOnValueChange(({ newValue }) => {
    const list: any[] = newValue?.list || [];
    debounceSave(list);
  }, control);

  React.useEffect(() => {
    getInterceptors().then(value => {
      control.setValue({
        list: value,
      });
    });
  }, [control]);

  useRuntimeMessageListener<RequestRecord | ResponseRecord>('intercept-records', (data) => {
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
      if (data.type === 'request') {
        return [
          {
            id: data.id,
            [data.type]: data,
          },
          ...pre,
        ];
      }
      return pre;
    });
  });

  return (
    <RecordsContext.Provider value={{ records, setRecords }}>
      <Form
        control={control}
      >
        <Form.List
          name="list"
        >
          {
            (fields, control) => {
              return (
                <Box
                  sx={{
                    marginTop: 1,
                  }}
                >
                  <Box
                    sx={{
                      padding: 1,
                      display: 'flex',
                      gap: 1,
                      alignItems: 'center',
                      flexWrap: 'wrap',
                    }}
                  >
                    {
                      fields.map(field => {
                        return (
                          <Form.Group
                            name={field.name}
                            key={field.key}
                          >
                            <Form.Update
                              condition={(newVal, oldVal) => {
                                return newVal?.regex !== oldVal?.regex || newVal?.enabled !== oldVal?.enabled;
                              }}
                            >
                              {
                                (itemControl) => (
                                  <Chip
                                    key={field.key}
                                    onClick={() => {
                                      setTab(field.name);
                                    }}
                                    variant={field.name === tab ? 'filled' : 'outlined'}
                                    onDelete={() => {
                                      createConfirm({
                                        title: '警告',
                                        content: (
                                          <Stack
                                            direction="row"
                                            alignItems="center"
                                            spacing={1}
                                          >
                                            <Typography>确定删除</Typography>
                                            <Chip
                                              size="small"
                                              color="warning"
                                              label={itemControl?.getValue()?.regex}
                                              sx={{
                                                minWidth: 35,
                                              }}
                                            />
                                          </Stack>
                                        ),
                                      }).then((confirm) => {
                                        if (confirm) {
                                          control.remove(field.name);
                                          if (field.name === tab) {
                                            setTab(Math.max(0, field.name - 1));
                                          }
                                        }
                                      });
                                    }}
                                    color={itemControl?.getValue()?.enabled ? 'primary' : 'default'}
                                    label={itemControl?.getValue()?.regex}
                                  />
                                )
                              }
                            </Form.Update>
                          </Form.Group>
                        );
                      })
                    }
                    <Tooltip
                      title="新增拦截器"
                      placement="top"
                      arrow
                    >
                      <IconButton
                        onClick={() => control.add(generateDefaultItem())}
                        color="primary"
                      >
                        <Add />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  {
                    (() => {
                      const field = fields.find(field => field.name === tab);
                      if (field) {
                        return (
                          <Box>
                            <Form.Group name={field.name} key={field.key}>
                              <Item />
                            </Form.Group>
                          </Box>
                        );
                      }
                      return null;
                    })()
                  }
                </Box>
              );
            }
          }
        </Form.List>
      </Form>
    </RecordsContext.Provider>
  );
};

export default Interceptors;
