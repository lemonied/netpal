import CodeEditor, { EditorContainer, loader } from '@/components/CodeEditor';
import type { EditorProps } from '@/components/CodeEditor';

loader.init().then(monaco => {
  monaco.languages.typescript.javascriptDefaults.addExtraLib(`

declare const frameURL: string;

interface RequestContext {
  url: string;
  headers: Record<string, string>;
  body?: string;
}
function RequestInterceptor(ctx: RequestContext): Promise<RequestContext>;

interface ResponseContext {
  readonly headers: Record<string, string>;
  body?: string;
  readonly status: number;
  readonly request: SimpleRequestContext;
}
function ResponseInterceptor(ctx: ResponseContext): Promise<ResponseContext>;

declare function debug(ctx: RequestContext | ResponseContext): Promise<void>;
`);
});

const CtxEditor = (props: EditorProps) => {

  return (
    <EditorContainer min={50}>
      <CodeEditor
        {...props}
        language="javascript"
        options={{
          tabSize: 2,
          minimap: {
            enabled: false,
          },
          scrollbar: {
            arrowSize: 3,
            vertical: 'hidden',
            alwaysConsumeMouseWheel: false,
          },
        }}
      />
    </EditorContainer>
  );
};

export { CtxEditor };
