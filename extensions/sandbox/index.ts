import { messageListener } from '@/utils';

messageListener('script-evaluate', async (data, resolve, reject) => {
  try {
    const result = window.eval(data);
    if (result instanceof Promise) {
      resolve(await result);
    } else {
      resolve(result);
    }
  } catch (e: any) {
    reject(e?.message);
  }
}, window.top!);
