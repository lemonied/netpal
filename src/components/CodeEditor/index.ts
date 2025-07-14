import Editor, { loader } from '@monaco-editor/react';
import { IS_CHROME_EXTENSION } from '@/utils';

loader.config({
  'vs/nls': {
    availableLanguages: {
      '*': 'zh-cn',
    },
  },
  paths: {
    vs: new URL(`${import.meta.env.BASE_URL}monaco-editor/vs`, window.location.href).href,
  },
});

if (IS_CHROME_EXTENSION) {
  self.MonacoEnvironment = {
    getWorkerUrl: function () {
      return chrome.runtime.getURL('monaco-editor/vs/base/worker/workerMain.js');
    },
  };
}

export default Editor;

export * from '@monaco-editor/react';
