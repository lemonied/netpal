import { debounce } from 'lodash';

export const onWindowFocus = (callback: () => any) => {
  const debounceCallback = debounce(callback, 10);
  const onVisibilityChange = () => {
    if (!document.hidden) {
      debounceCallback();
    }
  };
  const onFocus = () => {
    debounceCallback();
  };
  window.addEventListener('visibilitychange', onVisibilityChange);
  window.addEventListener('focus', onFocus);

  return () => {
    window.removeEventListener('visibilitychange', onVisibilityChange);
    window.removeEventListener('focus', onFocus);
  };
};
