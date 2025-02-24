import { randomStr } from '@/utils';

let requestInterceptors: Window['netpalInterceptors']['request'] = [];
let responseInterceptors: Window['netpalInterceptors']['response'] = [];

function clearInterceptors() {
  requestInterceptors.forEach(item => {
    const index = window.netpalInterceptors.request.findIndex(v => v === item);
    if (index > -1) {
      window.netpalInterceptors.request.splice(index, 1);
    }
  });
  responseInterceptors.forEach(item => {
    const index = window.netpalInterceptors.response.findIndex(v => v === item);
    if (index > -1) {
      window.netpalInterceptors.response.splice(index, 1);
    }
  });
}

async function reload(reqStr: string, resStr: string) {
  const script = document.createElement('script');
  const callbackName = randomStr('netpalCallback');
  const callback = (reqInterceptors: Window['netpalInterceptors']['request'], resInterceptors: Window['netpalInterceptors']['response']) => {
    clearInterceptors();
    requestInterceptors = reqInterceptors;
    responseInterceptors = resInterceptors;
    window.netpalInterceptors.request.push(...requestInterceptors);
    window.netpalInterceptors.response.push(...responseInterceptors);
  };
  (window as any)[callbackName] = callback;
  script.innerHTML = `window.${callbackName}(${reqStr}, ${resStr})`;
  document.body.appendChild(script);

};

window.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'netpal-receive') {
    const action = e.data.action;
    const reqStr: string = e.data.requestInterceptors;
    const resStr: string = e.data.responseInterceptors;
    switch (action) {
      case 'reload': {
        reload(reqStr, resStr);
      }
    }
  }
});
