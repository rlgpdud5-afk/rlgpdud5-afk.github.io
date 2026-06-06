import { FitAddon } from '@xterm/addon-fit';
import { Terminal } from '@xterm/xterm';
import { useCallback, useEffect, useRef } from 'react';
import '@xterm/xterm/css/xterm.css';

function attachImeSupport(term: Terminal, container: HTMLElement) {
  let composing = false;

  term.attachCustomKeyEventHandler((event) => {
    if (event.type === 'keydown') {
      if (composing || event.isComposing || event.keyCode === 229 || event.key === 'Process') {
        return false;
      }
    }
    return true;
  });

  const textarea = container.querySelector<HTMLTextAreaElement>('.xterm-helper-textarea');
  if (textarea) {
    textarea.setAttribute('lang', 'ko');
    textarea.setAttribute('spellcheck', 'false');
    textarea.setAttribute('autocorrect', 'off');
    textarea.setAttribute('autocapitalize', 'off');
    textarea.addEventListener('compositionstart', () => {
      composing = true;
    });
    textarea.addEventListener('compositionend', () => {
      composing = false;
    });
  }

  const focusTerm = () => {
    term.focus();
    textarea?.focus();
  };

  container.addEventListener('mousedown', focusTerm);
  requestAnimationFrame(focusTerm);

  return () => container.removeEventListener('mousedown', focusTerm);
}

function syncPtySize(term: Terminal, fit: FitAddon) {
  fit.fit();
  if (window.dgigTerminal && term.cols > 0 && term.rows > 0) {
    window.dgigTerminal.resize(term.cols, term.rows);
  }
}

export function useTerminal(taskRootDir: string, open: boolean) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const termRef = useRef<Terminal | null>(null);
  const fitRef = useRef<FitAddon | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  const spawn = useCallback(async () => {
    if (!window.dgigTerminal || !taskRootDir) return;
    const res = await window.dgigTerminal.spawn(taskRootDir);
    if (!res.ok && termRef.current) {
      termRef.current.writeln(`\r\n\x1b[33m[terminal] ${res.error || 'unavailable'}\x1b[0m`);
    } else if (termRef.current && fitRef.current) {
      syncPtySize(termRef.current, fitRef.current);
    }
  }, [taskRootDir]);

  useEffect(() => {
    if (!open || !containerRef.current) return;

    const term = new Terminal({
      theme: {
        background: '#0a0c10',
        foreground: '#34d399',
        cursor: '#34d399',
      },
      fontFamily: '"D2Coding", "Cascadia Code", Consolas, "Malgun Gothic", monospace',
      fontSize: 13,
      cursorBlink: true,
      scrollback: 4000,
    });
    const fit = new FitAddon();
    term.loadAddon(fit);
    const container = containerRef.current;
    term.open(container);
    const detachIme = attachImeSupport(term, container);
    syncPtySize(term, fit);
    term.writeln('\x1b[36mD-GIG Secure Terminal\x1b[0m');
    term.writeln('\x1b[90m한/영 전환 후 입력 (UTF-8)\x1b[0m');

    termRef.current = term;
    fitRef.current = fit;

    if (window.dgigTerminal) {
      const off = window.dgigTerminal.onData((data) => term.write(data));
      term.onData((data) => window.dgigTerminal?.write(data));
      cleanupRef.current = () => {
        off();
        window.dgigTerminal?.kill();
      };
      spawn();
    } else {
      term.writeln('Electron 전용 — npm run electron 으로 실행하세요.');
      cleanupRef.current = null;
    }

    const onResize = () => syncPtySize(term, fit);
    window.addEventListener('resize', onResize);

    const ro =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => syncPtySize(term, fit))
        : null;
    if (ro && containerRef.current) ro.observe(containerRef.current);

    return () => {
      detachIme();
      window.removeEventListener('resize', onResize);
      ro?.disconnect();
      cleanupRef.current?.();
      term.dispose();
      termRef.current = null;
      fitRef.current = null;
    };
  }, [open, spawn, taskRootDir]);

  useEffect(() => {
    if (open && fitRef.current && termRef.current) {
      requestAnimationFrame(() => syncPtySize(termRef.current!, fitRef.current!));
    }
  }, [open]);

  return { containerRef };
}
