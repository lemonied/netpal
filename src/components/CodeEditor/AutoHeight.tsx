import React from 'react';
import type { OnMount } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';

interface EditorContainerProps {
  children: React.ReactElement<{ onMount?: OnMount, options?: editor.IStandaloneEditorConstructionOptions }, any>;
  min?: number;
  max?: number;
}
const EditorContainer = (props: EditorContainerProps) => {

  const { min, max, children } = props;

  const [height, setHeight] = React.useState(min);

  return (
    <div
      style={{ height }}
    >
      {
        React.cloneElement(children, {
          onMount(editor, monaco) {
            editor.onDidContentSizeChange((e) => {
              let h = e.contentHeight;
              if (typeof min === 'number') {
                h = Math.max(min, h);
              }
              if (typeof max === 'number') {
                h = Math.min(max, h);
              }
              setHeight(h);
            });
            return children.props.onMount?.(editor, monaco);
          },
          options: {
            ...children.props.options,
            scrollBeyondLastLine: false,
          },
        })
      }
    </div>
  );
};

export { EditorContainer };
