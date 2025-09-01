export const sleep = (timestamp = 0) => {
  return new Promise<void>((resolve) => {
    window.setTimeout(() => {
      resolve();
    }, timestamp);
  });
};
