import React from 'react';

export const usePrevious = <T>(value: T) => {
  const previous = React.useRef<T>(undefined);
  const current = React.useRef(value);

  if (current.current !== value) {
    previous.current = current.current;
    current.current = value;
  }

  return previous.current;
};
