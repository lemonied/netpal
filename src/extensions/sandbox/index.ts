window.addEventListener('message', (e) => {
  const data = e.data;
  if (data && data.type === 'netpal-script-evaluate') {
    const key = data.key;
    const result = window.eval(data.data);
    if (result instanceof Promise) {
      return result.then(res => {
        window.postMessage({
          type: 'netpal-script-result',
          key,
          data: res,
        }, '*');
      });
    } else {
      window.postMessage({
        type: 'netpal-script-result',
        key,
        data: result,
      }, '*');
    }
  }
});
