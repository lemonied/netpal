window.addEventListener('message', async (e) => {
  const message = e.data;
  const key = message.key;
  const script = message.script;
  try {
    const result = window.eval(script);
    window.parent.postMessage({
      key,
      data: await result,
    }, '*');
  } catch (e: any) {
    window.parent.postMessage({
      key,
      error: e?.message,
      data: undefined,
    }, '*');
  }
});
