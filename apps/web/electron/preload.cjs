const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('dgigFs', {
  getTaskRoot: (taskId) => ipcRenderer.invoke('workspace:getTaskRoot', { taskId }),
  readFile: (filePath) => ipcRenderer.invoke('fs:readFile', { path: filePath }),
  writeFile: (filePath, content) => ipcRenderer.invoke('fs:writeFile', { path: filePath, content }),
  readDir: (dirPath) => ipcRenderer.invoke('fs:readDir', { path: dirPath }),
  deleteFile: (filePath) => ipcRenderer.invoke('fs:deleteFile', { path: filePath }),
  mkdir: (dirPath) => ipcRenderer.invoke('fs:mkdir', { path: dirPath }),
});

contextBridge.exposeInMainWorld('dgigApi', {
  request: (args) => ipcRenderer.invoke('api:request', args),
});

contextBridge.exposeInMainWorld('dgigGit', {
  status: (repoPath) => ipcRenderer.invoke('git:status', { repoPath }),
  diff: (repoPath, file) => ipcRenderer.invoke('git:diff', { repoPath, file }),
  filePair: (repoPath, file) => ipcRenderer.invoke('git:filePair', { repoPath, file }),
  stage: (repoPath, files) => ipcRenderer.invoke('git:stage', { repoPath, files }),
  unstage: (repoPath, files) => ipcRenderer.invoke('git:unstage', { repoPath, files }),
  commit: (repoPath, message) => ipcRenderer.invoke('git:commit', { repoPath, message }),
  log: (repoPath, n) => ipcRenderer.invoke('git:log', { repoPath, n }),
  branches: (repoPath) => ipcRenderer.invoke('git:branches', { repoPath }),
  checkout: (repoPath, branch) => ipcRenderer.invoke('git:checkout', { repoPath, branch }),
  newBranch: (repoPath, name) => ipcRenderer.invoke('git:newBranch', { repoPath, name }),
  commitFiles: (repoPath, hash) => ipcRenderer.invoke('git:commitFiles', { repoPath, hash }),
});

contextBridge.exposeInMainWorld('dgigTerminal', {
  spawn: (cwd) => ipcRenderer.invoke('terminal:spawn', { cwd }),
  write: (data) => ipcRenderer.send('terminal:write', data),
  resize: (cols, rows) => ipcRenderer.send('terminal:resize', { cols, rows }),
  kill: () => ipcRenderer.invoke('terminal:kill'),
  onData: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('terminal:data', handler);
    return () => ipcRenderer.removeListener('terminal:data', handler);
  },
});
