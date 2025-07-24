import React from 'react';
import { Editor, DiffEditor } from '@monaco-editor/react';
import type { EditorProps, DiffEditorProps } from '@monaco-editor/react';

type EditorElement = React.ReactElement<EditorProps, typeof Editor>;
type DiffEditorElement = React.ReactElement<DiffEditorProps, typeof DiffEditor>;

interface EditorContainerProps {
  children: EditorElement | DiffEditorElement;
  min?: number;
  max?: number;
}
const EditorContainer = (props: EditorContainerProps) => {

  const { min, max, children } = props;

  const [height, setHeight] = React.useState(min);

  const set = (h: number) => {
    if (typeof min === 'number') {
      h = Math.max(min, h);
    }
    if (typeof max === 'number') {
      h = Math.min(max, h);
    }
    setHeight(h);
  };
  const setRef = React.useRef(set);
  setRef.current = set;

  return (
    <div
      style={{ height }}
    >
      {
        (() => {
          if (children.type === Editor) {
            const child = children as EditorElement;
            return React.cloneElement(child, {
              onMount(editor, monaco) {
                editor.onDidContentSizeChange((e) => {
                  setRef.current(e.contentHeight);
                });
                return child.props.onMount?.(editor, monaco);
              },
              options: {
                ...child.props.options,
                scrollBeyondLastLine: false,
              },
            });
          }
          if (children.type === DiffEditor) {
            const child = children as DiffEditorElement;
            return React.cloneElement(child, {
              onMount(editor, monaco) {
                editor.onDidUpdateDiff(() => {
                  setRef.current(
                    Math.max(
                      editor.getModifiedEditor().getContentHeight(),
                      editor.getOriginalEditor().getContentHeight(),
                    ),
                  );
                });
                return child.props.onMount?.(editor, monaco);
              },
              options: {
                ...child.props.options,
                scrollBeyondLastLine: false,
              },
            });
          }
        })()

      }
    </div>
  );
};

export { EditorContainer };
