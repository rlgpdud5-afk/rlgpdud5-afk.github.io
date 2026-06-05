import { useState } from 'react';
import type { FileNode } from '../dgig-globals';
import { deletePath, mkdir, writeFile } from '../ipc/fileSystem';

export function FileTree({
  taskId,
  cwd,
  nodes,
  loading,
  error,
  onOpen,
  onRefresh,
  onGoUp,
}: {
  taskId: string;
  cwd: string;
  nodes: FileNode[];
  loading: boolean;
  error: string;
  onOpen: (node: FileNode) => void;
  onRefresh: () => void;
  onGoUp: () => void;
}) {
  const [menu, setMenu] = useState<{ x: number; y: number; node: FileNode | null } | null>(null);

  const closeMenu = () => setMenu(null);

  const handleContext = (e: React.MouseEvent, node: FileNode | null) => {
    e.preventDefault();
    setMenu({ x: e.clientX, y: e.clientY, node });
  };

  const createFile = async () => {
    const name = window.prompt('새 파일 이름', 'untitled.ts');
    if (!name) return closeMenu();
    const rel = cwd === '.' ? name : `${cwd}/${name}`;
    await writeFile(rel, '', taskId);
    closeMenu();
    onRefresh();
  };

  const createFolder = async () => {
    const name = window.prompt('새 폴더 이름', 'newfolder');
    if (!name) return closeMenu();
    const rel = cwd === '.' ? name : `${cwd}/${name}`;
    await mkdir(rel, taskId);
    closeMenu();
    onRefresh();
  };

  const removeNode = async (node: FileNode) => {
    if (!window.confirm(`"${node.name}"을(를) 삭제할까요?`)) return;
    await deletePath(node.path, taskId);
    closeMenu();
    onRefresh();
  };

  return (
    <aside className="ce-file-tree" onClick={closeMenu}>
      <div className="ce-file-tree-head">
        <button type="button" className="ce-tree-btn" onClick={onGoUp} disabled={cwd === '.'}>
          ↑
        </button>
        <span className="ce-file-tree-path" title={cwd}>
          {cwd === '.' ? '/' : cwd}
        </span>
        <button type="button" className="ce-tree-btn" onClick={onRefresh}>
          ↻
        </button>
      </div>
      {loading && <p className="ce-file-tree-msg">Loading…</p>}
      {error && <p className="ce-file-tree-msg ce-file-tree-msg--err">{error}</p>}
      <ul className="ce-file-tree-list" onContextMenu={(e) => handleContext(e, null)}>
        {nodes.map((node) => (
          <li
            key={node.path}
            className={'ce-file-tree-item' + (node.isDirectory ? ' is-dir' : '')}
            onDoubleClick={() => onOpen(node)}
            onContextMenu={(e) => handleContext(e, node)}
          >
            <span className="ce-file-tree-icon">{node.isDirectory ? '▸' : '◇'}</span>
            {node.name}
          </li>
        ))}
      </ul>
      {menu && (
        <div
          className="ce-context-menu"
          style={{ top: menu.y, left: menu.x }}
          role="menu"
          onClick={(e) => e.stopPropagation()}
        >
          <button type="button" role="menuitem" onClick={createFile}>
            New File
          </button>
          <button type="button" role="menuitem" onClick={createFolder}>
            New Folder
          </button>
          {menu.node && (
            <button type="button" role="menuitem" onClick={() => removeNode(menu.node!)}>
              Delete
            </button>
          )}
        </div>
      )}
    </aside>
  );
}
