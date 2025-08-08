import { createConfirm } from '@/components/Dialog';
import { FileUpload } from '@mui/icons-material';
import { Box, Button, Chip, Stack, styled, Typography } from '@mui/material';
import Form from 'form-pilot';
import React from 'react';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

interface FilesProps {
  name: string;
}
const Files = (props: FilesProps) => {

  const { name } = props;
  const [key, setKey] = React.useState(0);

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 1,
      }}
    >
      <Form.List
        name={name}
      >
        {
          (fields, ctl) => {
            return (
              <>
                {
                  fields.map(field => {
                    return (
                      <Form.Group
                        key={field.key}
                        name={field.name}
                      >
                        <Form.Item
                          name="name"
                        >
                          {
                            (p) => {
                              return (
                                <Chip
                                  label={p.value as string}
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
                                            label={p.value as string}
                                            sx={{
                                              minWidth: 35,
                                            }}
                                          />
                                        </Stack>
                                      ),
                                    }).then((confirm) => {
                                      if (confirm) {
                                        ctl.remove(field.name);
                                      }
                                    });
                                  }}
                                />
                              );
                            }
                          }
                        </Form.Item>
                      </Form.Group>
                    );
                  })
                }
                <Button
                  component="label"
                  startIcon={<FileUpload />}
                  size="small"
                >
                  文件变量
                  <VisuallyHiddenInput
                    key={key}
                    type="file"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = function (e) {
                          const content = e.target?.result;
                          if (typeof content === 'string') {
                            ctl.add({
                              name: file.name,
                              content,
                            });
                            setKey(pre => pre + 1);
                          }
                        };
                        reader.readAsText(file);
                      }
                    }}
                  />
                </Button>
              </>
            );
          }
        }
      </Form.List>
    </Box>
  );
};

export { Files };
