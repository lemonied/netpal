
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

async function reload(reqI10s: typeof requestInterceptors, resI10s: typeof responseInterceptors) {
  clearInterceptors();
  requestInterceptors = reqI10s;
  responseInterceptors = resI10s;
  window.netpalInterceptors.request.push(...requestInterceptors);
  window.netpalInterceptors.response.push(...responseInterceptors);
};

(window as any).netpalReload = reload;
