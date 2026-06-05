import type { GitBranchInfo, GitFilePair, GitLogEntry, GitStatusResult } from './types';

export type DgigGitApi = {
  status: (repoPath: string) => Promise<GitStatusResult>;
  diff: (repoPath: string, file: string) => Promise<string>;
  filePair: (repoPath: string, file: string) => Promise<GitFilePair>;
  stage: (repoPath: string, files: string[]) => Promise<{ ok: boolean }>;
  unstage: (repoPath: string, files: string[]) => Promise<{ ok: boolean }>;
  commit: (repoPath: string, message: string) => Promise<{ ok: boolean }>;
  log: (repoPath: string, n?: number) => Promise<{ commits: GitLogEntry[] }>;
  branches: (repoPath: string) => Promise<GitBranchInfo>;
  checkout: (repoPath: string, branch: string) => Promise<{ ok: boolean }>;
  newBranch: (repoPath: string, name: string) => Promise<{ ok: boolean }>;
  commitFiles: (repoPath: string, hash: string) => Promise<{ files: string[] }>;
};

declare global {
  interface Window {
    dgigGit?: DgigGitApi;
  }
}

export {};
