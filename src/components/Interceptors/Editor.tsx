import React from 'react';
import CodeEditor, { loader } from '@/components/CodeEditor';
import type { EditorProps } from '@/components/CodeEditor';
import type { editor } from 'monaco-editor';

loader.init().then(monaco => {
  monaco.languages.typescript.javascriptDefaults.addExtraLib(`

declare const frameURL: string;

interface RequestContext {
  url: string;
  headers: Record<string, string>;
  body?: string;
}

interface ResponseContext {
  readonly headers: Record<string, string>;
  body?: string;
  readonly status: number;
  readonly request: SimpleRequestContext;
}
`);
});

const ContextEditor = (props: EditorProps) => {

  const editorRef = React.useRef<editor.IStandaloneCodeEditor>(null);

  return (
    <div
      style={{ height: 200 }}
    >
      <CodeEditor
        {...props}
        language="javascript"
        onMount={(editor) => {
          editorRef.current = editor;
        }}
        options={{
          tabSize: 2,
          minimap: {
            enabled: false,
          },
          scrollbar: {
            arrowSize: 3,
          },
        }}
      />
    </div>
  );
};

export { ContextEditor };
