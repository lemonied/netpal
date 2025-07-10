/**
 * @description 参考文档
 * @see https://developer.chrome.com/docs/extensions/reference/api
 */

export async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  return tab;
}
