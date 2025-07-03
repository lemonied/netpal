import Editor, { loader } from '@monaco-editor/react';

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

loader.init().then(monaco => {
  monaco.languages.typescript.javascriptDefaults.addExtraLib(`
/**
 * @typedef {Object} RequestContext
 * @property {string} url
 * @property {[string, string][]} headers
 * @property {string} body
 */

/**
 * @typedef {Object} ResponseContext
 * @property {number} status
 * @property {[string, string][]} headers
 * @property {string} body
 * @property {RequestContext} request
 */
`);
});

export default Editor;

export * from '@monaco-editor/react';
