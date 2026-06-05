# Code editor module

PRD: `docs/DGIG_CODE_EDITOR_PRD.md`  
Cursor: `docs/DGIG_CODE_EDITOR_CURSOR_PROMPT_v2.md`  
VSCode 기능: `docs/DGIG_CODE_EDITOR_VSCODE_FEATURES_PROMPT.md`

## VSCode-style features (구현됨)

- IntelliSense + `window.dgigFs` / `window.dgigTerminal` 타입 (`monacoSetup.ts`)
- Snippets: `rafce`, `useState`, `dgigRead`, … (`snippets/index.ts`)
- Split editor, minimap toggle, breadcrumb
- Command palette, Find in Files, Problems panel

## 단축키 (코드 탭)

| 단축키 | 기능 |
|--------|------|
| Ctrl+\ | Split 토글 |
| Ctrl+Shift+P | Command Palette |
| Ctrl+Shift+F | Find in Files |
| Ctrl+Shift+M | Problems |
| F12 | Go to Definition |
| Ctrl+S | 포맷 후 저장 |

## Run

```bash
cd apps/web
npm install
npm run dev          # browser — localStorage VFS fallback
npm run electron     # Electron — fs IPC + terminal (node-pty)
```

## Entry

작업공간 → **⌨ Code** 탭 → `CodeEditorPage`

## IPC (Electron)

| Channel | Purpose |
|---------|---------|
| `workspace:getTaskRoot` | Task 루트 생성·시드 |
| `fs:readFile` / `fs:writeFile` / `fs:readDir` / `fs:deleteFile` / `fs:mkdir` | 파일 I/O |
| `terminal:spawn` / `terminal:write` / `terminal:resize` / `terminal:kill` | xterm + node-pty |

Preload: `electron/preload.cjs` → `window.dgigFs`, `window.dgigTerminal`
