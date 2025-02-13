import Editor, { loader } from '@monaco-editor/react';

loader.config({
  'vs/nls': {
    availableLanguages: {
      '*': 'zh-cn',
    },
  },
  paths: {
    vs: 'https://gw.alipayobjects.com/os/lib/monaco-editor/0.50.0/min/vs',
  },
});

export default Editor;

export * from '@monaco-editor/react';
