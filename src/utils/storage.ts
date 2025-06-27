export async function saveInterceptor(value: any) {
  return await chrome.storage.local.set({ interceptors: JSON.stringify(value) });
}

export async function getInterceptors<T=any>() {
  const value = await chrome.storage.local.get(['interceptors']);
  return JSON.parse(value.interceptors) as T;
}
