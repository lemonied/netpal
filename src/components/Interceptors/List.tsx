import Form from 'form-pilot';
import Item from './Item';
import { Button } from '@mui/material';
import { Add } from '@mui/icons-material';

const Interceptors = () => {

  const control = Form.useControl();

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
                    onClick={() => control.add()}
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
