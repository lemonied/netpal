import { onWindowFocus } from '@/utils';
import React from 'react';

export const useWindowFocus = (fn: () => void) => {

  const fnRef = React.useRef(fn);
  fnRef.current = React.useMemo(() => fn, [fn]);

  React.useEffect(() => {
    return onWindowFocus(() => {
      fnRef.current();
    });
  }, []);
};