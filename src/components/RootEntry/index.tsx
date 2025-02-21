import React from 'react';
import FloatingAction from '../FloatingAction';
import Interceptors from '../Interceptors';
import ResizableDrawer from '../ResizableDrawer';

const RootEntry = () => {

  const [open, setOpen] = React.useState(false);

  return (
    <>
      {
        open && (
          <ResizableDrawer
            height={500}
          >
            <Interceptors />
          </ResizableDrawer>
        )
      }
      <FloatingAction
        onClick={() => {
          setOpen(pre => !pre);
        }}
      />
    </>
  );

};

export default RootEntry;
