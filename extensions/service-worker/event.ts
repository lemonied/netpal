import {
  buildMessage,
  isBridgeMessage,
  isMatchType,
  randomStr,
  getCurrentTab,
  getClientInterceptors,
} from '@/utils';

const sidePanels = new Set<number>();

async function notifySidePanelStat() {
  const currentTab = await getCurrentTab();
  const tabId = currentTab.id;
  const windowId = currentTab.windowId;
  if (typeof tabId === 'number') {
    chrome.tabs.sendMessage(tabId, buildMessage({
      type: 'panel-status',
      key: randomStr('panel-status'),
      data: sidePanels.has(windowId),
    }));
  }
}

chrome.runtime.onConnect.addListener((port) => {
  const name = port.name;
  if (name.startsWith('sidePanelStat')) {
    const windowId = Number(name.split('_')[1]);
    sidePanels.add(windowId);
    notifySidePanelStat();
    port.onDisconnect.addListener(() => {
      sidePanels.delete(windowId);
      notifySidePanelStat();
    });
  }
});

chrome.tabs.onActivated.addListener(async (tab) => {
  const tabId = tab.tabId;
  const windowId = tab.windowId;
  chrome.tabs.sendMessage(tabId, buildMessage({
    type: 'interceptors-reload',
    key: randomStr('interceptors-reload'),
    data: sidePanels.has(windowId) ? await getClientInterceptors() : [],
  }));
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

  const tab = sender.tab;

  if (tab && isBridgeMessage(message)) {
    const tabId = tab.id;
    const windowId = tab.windowId;
    switch (true) {
      case isMatchType(message, 'open-panel') && typeof tabId === 'number': {
        chrome.sidePanel.open({ tabId });
        break;
      }
      case isMatchType(message, 'get-panel-status'): {
        sendResponse({
          data: sidePanels.has(windowId),
        });
        return true;
      }
      default: {
        // nothing
      }
    }
  }

});
