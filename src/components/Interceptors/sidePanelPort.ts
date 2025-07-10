import { IS_CHROME_EXTENSION } from '@/utils';

export const sidePanelPort = IS_CHROME_EXTENSION ? chrome.runtime.connect({ name: 'sidePanelStat' }) : undefined;
