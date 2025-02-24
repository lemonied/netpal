window.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'netpal-exec-script') {
    eval('alert(12345)');
  }
});
