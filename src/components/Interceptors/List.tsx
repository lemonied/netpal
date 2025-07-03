import React from 'react';
import Form from 'form-pilot';
import Item from './Item';
import { Button } from '@mui/material';
import { Add } from '@mui/icons-material';
import { DEFAULT_REQUEST_INTERCEPTOR, DEFAULT_RESPONSE_INTERCEPTOR } from './util';
import { debounce } from 'lodash';
import { getInterceptors, saveInterceptor } from '@/utils';

const debounceSave = debounce((value: any) => {
  saveInterceptor(value);
});

const Interceptors = () => {

  const control = Form.useControl();

  Form.useOnValueChange(({ newValue }) => {
    const list: any[] = newValue?.list || [];
    const body = list.map(item => [item.request, item.response]);
    debounceSave(body);
  }, control);

  React.useEffect(() => {
    getInterceptors().then(value => {
      control.setValue({
        list: value.map(v => {
          return {
            request: v[0],
            response: v[1],
          };
        }),
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
                <>
                  {
                    fields.map(field => {
                      return (
                        <Form.Group
                          name={field.name}
                          key={field.key}
                        >
                          <Item />
                        </Form.Group>
                      );
                    })
                  }
                  <Button
                    fullWidth
                    size="small"
                    variant="outlined"
                    startIcon={
                      <Add />
                    }
                    onClick={() => {
                      control.add({
                        request: DEFAULT_REQUEST_INTERCEPTOR,
                        response: DEFAULT_RESPONSE_INTERCEPTOR,
                      });
                    }}
                  >添加拦截器</Button>
                </>
              );
            }
          }
        </Form.List>
      </Form>
    </>
  );
};

export default Interceptors;
