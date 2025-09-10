/**
 * @description 参考文档
 * @see https://developer.chrome.com/docs/extensions/reference/api
 */

import { pick } from 'lodash';

export async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  return tab;
}

export async function saveInterceptor(value: any) {
  return await chrome.storage.local.set({ interceptors: JSON.stringify(value) });
}

export async function getInterceptors(): Promise<any[]> {
  const value = await chrome.storage.local.get(['interceptors']);
  try {
    return JSON.parse(value.interceptors);
  } catch {
    /* empty */
  }
  return [];
}

export async function getClientInterceptors() {
  const interceptors = await getInterceptors();
  return interceptors.map(item => pick(item, ['key', 'sandbox', 'regex', 'enabled']));
}

export async function getInterceptor(key: string) {
  const interceptors = await getInterceptors();
  return interceptors.find(item => item.key === key);
}

export async function saveConfig(value: any) {
  return await chrome.storage.local.set({ config: JSON.stringify(value) });
}

export async function getConfig<T = any>(): Promise<T | undefined> {
  const value = await chrome.storage.local.get(['config']);
  try {
    return JSON.parse(value.config);
  } catch {
    /* empty */
  }
}
