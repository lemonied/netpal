import { removeItem } from '@/utils';

const interceptors: Window['netpalInterceptors'] = {
  request: [],
  response: [],
};

async function reload() {
  interceptors.request.forEach(item => removeItem(window.netpalInterceptors.request, item));
  interceptors.response.forEach(item => removeItem(window.netpalInterceptors.response, item));
  interceptors.request = [];
  interceptors.response = [];
  window.netpalInterceptors.request.push(...interceptors.request);
  window.netpalInterceptors.response.push(...interceptors.response);
};


(window as any).netpalReload = reload;
