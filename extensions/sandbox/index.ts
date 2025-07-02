import { isBridgeMessage, isMatchType, messageReplySuffix } from '@/utils';

window.addEventListener('message', async (e) => {
  const message = e.data;
  if (isBridgeMessage(message) && isMatchType(message, 'evaluate-script')) {
    try {
      const result = window.eval(message.data);
      window.parent.postMessage({
        ...message,
        type: `${message.type}${messageReplySuffix}`,
        data: await result,
      }, '*');
    } catch (e: any) {
      window.parent.postMessage({
        ...message,
        type: `${message.type}${messageReplySuffix}`,
        error: e?.message,
        data: undefined,
      }, '*');
    }
  }
});
