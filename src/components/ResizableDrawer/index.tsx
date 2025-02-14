import React from 'react';
import { styled } from '@mui/material';

const Wrapper = styled('div')`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100000;
`;

interface SharedProps {
  children?: React.ReactNode;
  height: number;
}

const Content = (props: SharedProps) => {

  const { children } = props;
  const [height] = React.useState(props.height);

  return (
    <Wrapper
      style={{
        height,
      }}
    >{children}</Wrapper>
  );
};

const ResizableDrawer = (props: SharedProps) => {
  return (
    <Content {...props} />
  );
};

export default ResizableDrawer;
