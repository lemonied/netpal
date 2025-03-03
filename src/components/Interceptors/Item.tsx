import Editor from '@/components/CodeEditor';
import Form from 'form-pilot';

const Item = () => {
  return (
    <>
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
    </>
  );
};

export default Item;
