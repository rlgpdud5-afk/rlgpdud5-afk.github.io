import { FitAddon } from '@xterm/addon-fit';
import { Terminal } from '@xterm/xterm';
import { useCallback, useEffect, useRef } from 'react';
import '@xterm/xterm/css/xterm.css';

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
      fontFamily: 'Consolas, Monaco, monospace',
      fontSize: 12,
      cursorBlink: true,
    });
    const fit = new FitAddon();
    term.loadAddon(fit);
    term.open(containerRef.current);
    fit.fit();
    term.writeln('\x1b[36mD-GIG Secure Terminal\x1b[0m');

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

    const onResize = () => fit.fit();
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      cleanupRef.current?.();
      term.dispose();
      termRef.current = null;
      fitRef.current = null;
    };
  }, [open, spawn, taskRootDir]);

  useEffect(() => {
    if (open && fitRef.current) {
      requestAnimationFrame(() => fitRef.current?.fit());
    }
  }, [open]);

  return { containerRef };
}
