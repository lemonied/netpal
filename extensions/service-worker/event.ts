import {
  buildMessage,
  isBridgeMessage,
  isMatchType,
  MESSAGE_REPLY_SUFFIX,
  randomStr,
  getCurrentTab,
} from '@/utils';
import type { BridgeMessage } from '@/utils';

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
          ...message,
          data: sidePanels.has(windowId),
          type: `${message.type}${MESSAGE_REPLY_SUFFIX}`,
        } satisfies BridgeMessage);
        return true;
      }
      default: {
        // nothing
      }
    }
  }

});
