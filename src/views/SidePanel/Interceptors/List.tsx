import React from 'react';
import Form from 'form-pilot';
import Item from './Item';
import { Box, Button, Chip, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { DEFAULT_REQUEST_INTERCEPTOR, DEFAULT_RESPONSE_INTERCEPTOR } from '../utils';
import {
  buildMessage,
  getCurrentTab,
  getInterceptors,
  getClientInterceptors,
  randomStr,
  saveInterceptor,
} from '@/utils';
import { Add, Save } from '@mui/icons-material';
import { createConfirm } from '@/components/Dialog';
import { isEqual } from 'lodash';

const saveToDB = async (value: any) => {
  await saveInterceptor(value);
  const tab = await getCurrentTab();
  const tabId = tab.id;
  if (typeof tabId === 'number') {
    chrome.tabs.sendMessage(tabId, buildMessage({
      type: 'interceptors-reload',
      key: randomStr('interceptors-reload'),
      data: await getClientInterceptors(),
    }));
  }
};

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

  const control = Form.useControl();

  const [tab, setTab] = React.useState(0);
  const initialValue = React.useRef<any>(null);
  const [changed, setChanged] = React.useState(false);

  Form.useOnValueChange(({ newValue }) => {
    setChanged(!isEqual(initialValue.current, newValue));
  }, control);

  const save = () => {
    const value = control.getValue();
    saveToDB(value?.list);
    initialValue.current = value;
    setChanged(false);
  };

  React.useEffect(() => {
    getInterceptors().then(value => {
      initialValue.current = {
        list: value,
      };
      control.setValue(initialValue.current);
    });
  }, [control]);

  return (
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
                          <Form.Group name={field.name}>
                            <Item />
                          </Form.Group>
                        </Box>
                      );
                    }
                    return null;
                  })()
                }
                <Box
                  sx={{
                    padding: 2,
                  }}
                >
                  <Button
                    fullWidth
                    startIcon={
                      <Save />
                    }
                    variant={changed ? 'contained' : 'outlined'}
                    onClick={save}
                  >保存</Button>
                </Box>
              </Box>
            );
          }
        }
      </Form.List>
    </Form>
  );
};

export default Interceptors;
