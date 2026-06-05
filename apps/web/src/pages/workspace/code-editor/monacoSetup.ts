import type * as monaco from 'monaco-editor';
import { registerSnippets } from './snippets';

const DGIG_EXTRA_LIB = `
declare interface FileNode {
  name: string;
  path: string;
  isDirectory: boolean;
}
declare interface DgigFsApi {
  getTaskRoot(taskId: string): Promise<{ root: string }>;
  readFile(path: string): Promise<{ content: string }>;
  writeFile(path: string, content: string): Promise<{ ok: boolean }>;
  readDir(path: string): Promise<FileNode[]>;
  deleteFile(path: string): Promise<{ ok: boolean }>;
  mkdir(path: string): Promise<{ ok: boolean }>;
}
declare interface DgigTerminalApi {
  spawn(cwd: string): Promise<{ ok: boolean; error?: string }>;
  write(data: string): void;
  resize(cols: number, rows: number): void;
  kill(): Promise<{ ok: boolean }>;
  onData(callback: (data: string) => void): () => void;
}
interface Window {
  dgigFs?: DgigFsApi;
  dgigTerminal?: DgigTerminalApi;
}
`;

let configured = false;

export function setupMonaco(monacoApi: typeof monaco) {
  if (configured) return;
  configured = true;

  const ts = monacoApi.languages.typescript;

  const compilerOpts: monaco.languages.typescript.CompilerOptions = {
    target: ts.ScriptTarget.ESNext,
    allowNonTsExtensions: true,
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    module: ts.ModuleKind.ESNext,
    jsx: ts.JsxEmit.React,
    strict: false,
    noEmit: true,
    esModuleInterop: true,
    allowJs: true,
  };

  ts.typescriptDefaults.setCompilerOptions(compilerOpts);
  ts.javascriptDefaults.setCompilerOptions(compilerOpts);

  ts.typescriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
  });
  ts.javascriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
  });

  ts.typescriptDefaults.addExtraLib(DGIG_EXTRA_LIB, 'file:///dgig.d.ts');
  ts.javascriptDefaults.addExtraLib(DGIG_EXTRA_LIB, 'file:///dgig.d.ts');

  registerSnippets(monacoApi);
}

export const DEFAULT_MINIMAP = {
  enabled: true,
  side: 'right' as const,
  renderCharacters: false,
  scale: 1,
};
