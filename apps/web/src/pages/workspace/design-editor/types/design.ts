import type { TLEditorSnapshot } from 'tldraw';

/** Legacy Konva element (v1 .dgig) */
export interface LegacyDesignElement {
  id: string;
  type: 'rect' | 'ellipse' | 'text' | 'image';
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  visible: boolean;
  locked: boolean;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  cornerRadius?: number;
  text?: string;
  fontSize?: number;
  fontWeight?: number;
  color?: string;
  align?: 'left' | 'center' | 'right';
  imageSrc?: string;
  imagePath?: string;
}

export interface DgigDesignFile {
  version: '1.0' | '2.0';
  meta: {
    createdAt: string;
    taskId: string;
  };
  canvas: {
    width: number;
    height: number;
  };
  /** tldraw v2 save format */
  tldrawSnapshot?: TLEditorSnapshot;
  /** Konva v1 — loaded only for migration */
  elements?: LegacyDesignElement[];
}

export const DEFAULT_CANVAS = { width: 1440, height: 900 };

export type DesignTool = 'select' | 'rect' | 'ellipse' | 'text' | 'image';

export type LayerMeta = {
  name?: string;
  hidden?: boolean;
};

export function slugifyClass(name: string) {
  return (
    'layer-' +
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  );
}

export function layerNameFromShape(meta: unknown, fallback: string) {
  if (meta && typeof meta === 'object' && 'name' in meta) {
    const n = (meta as LayerMeta).name;
    if (typeof n === 'string' && n.trim()) return n.trim();
  }
  return fallback;
}
