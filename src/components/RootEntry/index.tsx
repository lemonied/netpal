import React from 'react';
import ReactDOM from 'react-dom';
import FloatingAction from '../FloatingAction';
import Interceptors from '../Interceptors';
import ResizableDrawer from '../ResizableDrawer';

const RootEntry = () => {

  const [container, setContainer] = React.useState<HTMLDivElement>();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    setContainer(container);

    return () => {
      document.body.removeChild(container);
    };
  }, []);

  return (
    <>
      {
        (() => {
          if (open && container) {
            return ReactDOM.createPortal(
              <ResizableDrawer
                height={500}
              >
                <Interceptors />
              </ResizableDrawer>,
              container,
            );
          }
          return null;
        })()
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
