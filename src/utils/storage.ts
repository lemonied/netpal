import { IS_CHROME_EXTENSION } from './constants';

export async function saveInterceptor(value: any) {
  if (IS_CHROME_EXTENSION) {
    return await chrome.storage.local.set({ interceptors: JSON.stringify(value) });
  }
}

export async function getInterceptors(): Promise<string[][]> {
  if (IS_CHROME_EXTENSION) {
    const value = await chrome.storage.local.get(['interceptors']);
    try {
      return JSON.parse(value.interceptors);
    } catch {
      /* empty */
    }
  }
  return [];
}
