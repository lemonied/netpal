import { isBridgeMessage } from '@/utils';
import type { BridgeMessage } from '@/utils';

window.addEventListener('message', (e) => {
  const data = e.data;
  if (isBridgeMessage(data) && data.type === 'netpal-script-evaluate') {
    const result = window.eval(data.data);
    const reply = (res: any) => {
      window.top?.postMessage({
        type: `${data.type}-reply`,
        key: data.key,
        data: res,
      } satisfies BridgeMessage, '*');
    };
    if (result instanceof Promise) {
      return result.then(res => {
        reply(res);
      });
    } else {
      reply(result);
    }
  }
});
