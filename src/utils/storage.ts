export async function saveInterceptor(value: any) {
  return await chrome.storage.local.set({ interceptors: JSON.stringify(value) });
}

export async function getInterceptors(): Promise<string[][]> {
  const value = await chrome.storage.local.get(['interceptors']);
  try {
    return JSON.parse(value.interceptors);
  } catch {
    return [];
  }
}
