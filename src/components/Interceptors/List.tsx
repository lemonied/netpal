import React from 'react';
import Form from 'form-pilot';
import Item from './Item';
import { Box, Button, Tab, Tabs, Typography } from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { DEFAULT_REQUEST_INTERCEPTOR, DEFAULT_RESPONSE_INTERCEPTOR } from './util';
import { debounce } from 'lodash';
import { getInterceptors, saveInterceptor } from '@/utils';

const debounceSave = debounce((value: any) => {
  saveInterceptor(value);
});

const defaultItem = {
  regex: '/.*/ig',
  request: DEFAULT_REQUEST_INTERCEPTOR,
  response: DEFAULT_RESPONSE_INTERCEPTOR,
};

const sideTabsWidth = '120px';

const Interceptors = () => {

  const [tab, setTab] = React.useState(0);
  const control = Form.useControl();

  Form.useOnValueChange(({ newValue }) => {
    const list: any[] = newValue?.list || [];
    const body = list.map(item => [item.request, item.response]);
    debounceSave(body);
  }, control);

  React.useEffect(() => {
    getInterceptors().then(value => {
      control.setValue({
        list: value.length ? value : [defaultItem],
      });
    });
  }, [control]);

  return (
    <>
      <Form
        control={control}
        initialValues={{
          list: [defaultItem],
        }}
      >
        <Form.List
          name="list"
        >
          {
            (fields, control) => {
              return (
                <Box
                  sx={{
                    display: 'flex',
                    marginTop: 1,
                  }}
                >
                  <Box
                    sx={{
                      flex: `0 0 ${sideTabsWidth}`,
                      width: sideTabsWidth,
                    }}
                  >
                    <Tabs
                      orientation="vertical"
                      value={tab}
                      onChange={(_, val) => {
                        if (typeof val === 'number') {
                          setTab(val);
                        } else if (val === 'add') {
                          control.add(defaultItem);
                        }
                      }}
                      sx={{
                        borderRight: 1,
                        borderColor: 'divider',
                        height: '100%',
                      }}
                    >
                      {
                        fields.map(field => {
                          return (
                            <Tab
                              value={field.name}
                              key={field.key}
                              label={
                                <Form.Group name={field.name} key={field.key}>
                                  <Form.Update>
                                    {
                                      (itemControl) => {
                                        return (
                                          <Box>
                                            <Typography
                                              sx={{
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                fontSize: '14px',
                                              }}
                                            >{itemControl?.getValue()?.regex}</Typography>
                                          </Box>
                                        );
                                      }
                                    }
                                  </Form.Update>
                                </Form.Group>
                              }
                            />
                          );
                        })
                      }
                      <Tab
                        value="add"
                        sx={{
                          padding: 1,
                        }}
                        label={
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            <Add
                              sx={{
                                fontSize: 18,
                              }}
                            />
                            <Typography
                              sx={{
                                fontSize: 14,
                              }}
                            >新增拦截器</Typography>
                          </Box>
                        }
                      />
                    </Tabs>
                  </Box>
                  {
                    (() => {
                      const field = fields.find(field => field.name === tab);
                      if (field) {
                        return (
                          <Box
                            sx={{
                              flex: `0 0 calc(100% - ${sideTabsWidth})`,
                              width: `calc(100% - ${sideTabsWidth})`,
                            }}
                          >
                            <Form.Group name={field.name} key={field.key}>
                              <Item />
                            </Form.Group>
                            {
                              fields.length > 1 && (
                                <Box
                                  padding={2}
                                >
                                  <Button
                                    fullWidth
                                    startIcon={
                                      <Delete />
                                    }
                                    onClick={e => {
                                      e.stopPropagation();
                                      control.remove(tab);
                                      setTab(pre => {
                                        return Math.max(pre - 1, 0);
                                      });
                                    }}
                                    color="error"
                                    variant="outlined"
                                  >删除</Button>
                                </Box>
                              )
                            }
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
