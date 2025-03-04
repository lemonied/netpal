import { onWindowFocus } from '@/utils';
import React from 'react';

export const useWindowFocus = (...args: Parameters<typeof onWindowFocus>) => {
  const [fn, options] = args;

  const fnRef = React.useRef(fn);
  fnRef.current = React.useMemo(() => fn, [fn]);
  const optionsRef = React.useRef(options);

  React.useEffect(() => {
    return onWindowFocus(() => {
      fnRef.current();
    }, optionsRef.current);
  }, []);
};