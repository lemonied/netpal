import React from 'react';
import CodeEditor from '@/components/CodeEditor';
import type { EditorProps } from '@/components/CodeEditor';
import type { editor } from 'monaco-editor';

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
