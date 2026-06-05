export type GitFileBadge = 'M' | 'A' | 'D' | 'U';

export type GitFileEntry = {
  path: string;
  badge: GitFileBadge;
  staged: boolean;
};

export type GitStatusResult = {
  current: string;
  tracking: string | null;
  files: GitFileEntry[];
};

export type GitLogEntry = {
  hash: string;
  hashShort: string;
  message: string;
  author: string;
  date: string;
};

export type GitBranchInfo = {
  current: string;
  all: string[];
};

export type GitFilePair = {
  original: string;
  modified: string;
};
