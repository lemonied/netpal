import { throttle } from 'lodash';

export interface OnWindowFocusOptions {
  wait?: number;
  immediate?: boolean;
}
export const onWindowFocus = (callback: () => any, options?: OnWindowFocusOptions) => {
  const { wait = 2000, immediate } = options || {};
  const debounceCallback = throttle(callback, wait, { trailing: false });
  const onVisibilityChange = () => {
    if (!document.hidden) {
      debounceCallback();
    }
  };
  const onFocus = () => {
    debounceCallback();
  };
  if (immediate) {
    debounceCallback();
  }
  window.addEventListener('visibilitychange', onVisibilityChange);
  window.addEventListener('focus', onFocus);

  return () => {
    window.removeEventListener('visibilitychange', onVisibilityChange);
    window.removeEventListener('focus', onFocus);
  };
};
