export type FileNode = {
  name: string;
  path: string;
  isDirectory: boolean;
};

export type DgigFsApi = {
  getTaskRoot: (taskId: string) => Promise<{ root: string }>;
  readFile: (path: string) => Promise<{ content: string }>;
  writeFile: (path: string, content: string) => Promise<{ ok: boolean }>;
  readDir: (path: string) => Promise<FileNode[]>;
  deleteFile: (path: string) => Promise<{ ok: boolean }>;
  mkdir: (path: string) => Promise<{ ok: boolean }>;
};

export type DgigTerminalApi = {
  spawn: (cwd: string) => Promise<{ ok: boolean; error?: string }>;
  write: (data: string) => void;
  resize: (cols: number, rows: number) => void;
  kill: () => Promise<{ ok: boolean }>;
  onData: (callback: (data: string) => void) => () => void;
};

declare global {
  interface Window {
    dgigFs?: DgigFsApi;
    dgigTerminal?: DgigTerminalApi;
  }
}

export {};
