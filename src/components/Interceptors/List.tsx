import React from 'react';
import Form from 'form-pilot';
import Item from './Item';
import { Box, Button, Chip, Stack, Typography } from '@mui/material';
import { DEFAULT_REQUEST_INTERCEPTOR, DEFAULT_RESPONSE_INTERCEPTOR } from './util';
import { debounce } from 'lodash';
import { buildMessage, getInterceptors, randomStr, saveInterceptor } from '@/utils';
import { Add } from '@mui/icons-material';
import { createConfirm } from '../Dialog';
import { getSidePanelPort } from './sidePanelPort';

const debounceSave = debounce(async (value: any) => {
  await saveInterceptor(value);
  getSidePanelPort()?.postMessage(buildMessage({
    type: 'interceptors-reload',
    key: randomStr('interceptors-reload'),
    data: await getInterceptors(),
  }));
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

  return (
    <>
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
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={
                        <Add />
                      }
                      onClick={() => control.add(generateDefaultItem())}
                    >新增拦截器</Button>
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
    </>
  );
};

export default Interceptors;
