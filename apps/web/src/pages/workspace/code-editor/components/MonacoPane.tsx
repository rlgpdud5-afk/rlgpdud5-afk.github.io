import { useRef } from 'react';
import Editor, { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import type { EditorTab } from '../hooks/useEditorTabs';
import { DEFAULT_MINIMAP, setupMonaco } from '../monacoSetup';

loader.config({ monaco });

export function MonacoPane({
  tab,
  onChange,
  minimapEnabled,
  onEditorReady,
  onFocus,
}: {
  tab: EditorTab | null;
  onChange: (value: string) => void;
  minimapEnabled: boolean;
  onEditorReady?: (editor: monaco.editor.IStandaloneCodeEditor) => void;
  onFocus?: () => void;
}) {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  if (!tab) {
    return (
      <div className="ce-monaco-empty">
        <p>파일 트리에서 파일을 열거나 + 로 새 파일을 만드세요.</p>
      </div>
    );
  }

  return (
    <div className="ce-monaco-wrap" onMouseDown={() => onFocus?.()}>
      <Editor
        key={tab.id}
        height="100%"
        language={tab.language}
        value={tab.content}
        theme="vs-dark"
        options={{
          minimap: { ...DEFAULT_MINIMAP, enabled: minimapEnabled },
          fontSize: 13,
          fontFamily: 'Consolas, Monaco, "Noto Sans KR", monospace',
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          wordWrap: 'off',
          tabSize: 2,
          renderWhitespace: 'selection',
          multiCursorModifier: 'alt',
        }}
        onChange={(v) => onChange(v ?? '')}
        onMount={(editor) => {
          setupMonaco(monaco);
          editorRef.current = editor;
          onEditorReady?.(editor);

          editor.addCommand(monaco.KeyCode.F12, () => {
            void editor.getAction('editor.action.revealDefinition')?.run();
          });
        }}
      />
    </div>
  );
}
