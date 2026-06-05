import type { Editor, TLShape } from 'tldraw';
import {
  createShapeId,
  GeoShapeGeoStyle,
  toRichText,
  type TLDefaultSizeStyle,
  type TLDefaultTextAlignStyle,
} from 'tldraw';
import type { DesignTool, LayerMeta, LegacyDesignElement } from '../types/design';
import { layerNameFromShape } from '../types/design';

export function shapeTypeLabel(shape: TLShape) {
  if (shape.type === 'geo') {
    const geo = (shape.props as { geo?: string }).geo;
    return geo === 'ellipse' || geo === 'oval' ? 'ellipse' : 'rect';
  }
  return shape.type;
}

export function shapeDisplayName(shape: TLShape) {
  return layerNameFromShape(shape.meta, `${shape.type}-${shape.id.slice(-4)}`);
}

export function applyTool(editor: Editor, tool: DesignTool) {
  switch (tool) {
    case 'select':
      editor.setCurrentTool('select');
      break;
    case 'rect':
      editor.setCurrentTool('geo');
      editor.setStyleForNextShapes(GeoShapeGeoStyle, 'rectangle');
      break;
    case 'ellipse':
      editor.setCurrentTool('geo');
      editor.setStyleForNextShapes(GeoShapeGeoStyle, 'ellipse');
      break;
    case 'text':
      editor.setCurrentTool('text');
      break;
    case 'image':
      editor.setCurrentTool('media');
      break;
    default:
      break;
  }
}

export function setShapeMetaName(editor: Editor, shapeId: TLShape['id'], name: string) {
  const shape = editor.getShape(shapeId);
  if (!shape) return;
  editor.updateShape({
    id: shape.id,
    type: shape.type,
    meta: { ...shape.meta, name },
  });
}

export function setShapeHidden(editor: Editor, shapeId: TLShape['id'], hidden: boolean) {
  const shape = editor.getShape(shapeId);
  if (!shape) return;
  editor.updateShape({
    id: shape.id,
    type: shape.type,
    meta: { ...(shape.meta as LayerMeta), hidden },
  });
}

export function fontSizeToSize(px: number): TLDefaultSizeStyle {
  if (px >= 32) return 'xl';
  if (px >= 22) return 'l';
  if (px >= 16) return 'm';
  return 's';
}

export function sizeToFontPx(size: TLDefaultSizeStyle) {
  const map: Record<TLDefaultSizeStyle, number> = { s: 14, m: 18, l: 24, xl: 36 };
  return map[size] ?? 18;
}

export function alignToTextAlign(align: string): TLDefaultTextAlignStyle {
  if (align === 'center') return 'middle';
  if (align === 'right') return 'end';
  return 'start';
}

export function textAlignToAlign(align: TLDefaultTextAlignStyle) {
  if (align === 'middle') return 'center';
  if (align === 'end') return 'right';
  return 'left';
}

export async function insertLocalImage(editor: Editor, file: File) {
  const url = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
  const center = editor.getViewportPageBounds().center;
  await editor.putExternalContent({
    type: 'files',
    files: [file],
    point: center,
  }).catch(() => {
    editor.createShape({
      id: createShapeId(),
      type: 'image',
      x: center.x - 80,
      y: center.y - 60,
      props: {
        w: 160,
        h: 120,
        assetId: null,
        playing: false,
        url: url,
        crop: null,
        flipX: false,
        flipY: false,
        altText: file.name,
      },
      meta: { name: file.name },
    });
  });
}

/** Best-effort import from Konva-era .dgig */
export function migrateLegacyElements(editor: Editor, elements: LegacyDesignElement[]) {
  for (const el of elements) {
    if (!el.visible) continue;
    const id = createShapeId();
    const meta: LayerMeta = { name: el.name, hidden: !el.visible };
    const opacity = Math.min(1, Math.max(0, el.opacity / 100));

    if (el.type === 'rect' || el.type === 'ellipse') {
      editor.createShape({
        id,
        type: 'geo',
        x: el.x,
        y: el.y,
        rotation: (el.rotation * Math.PI) / 180,
        opacity,
        isLocked: el.locked,
        meta,
        props: {
          geo: el.type === 'ellipse' ? 'ellipse' : 'rectangle',
          w: el.width,
          h: el.height,
          growY: 0,
          scale: 1,
          url: '',
          dash: 'draw',
          color: 'violet',
          labelColor: 'black',
          fill: 'solid',
          size: 'm',
          font: 'draw',
          align: 'middle',
          verticalAlign: 'middle',
          richText: toRichText(''),
        },
      });
    } else if (el.type === 'text') {
      editor.createShape({
        id,
        type: 'text',
        x: el.x,
        y: el.y,
        rotation: (el.rotation * Math.PI) / 180,
        opacity,
        isLocked: el.locked,
        meta,
        props: {
          richText: toRichText(el.text ?? 'Text'),
          color: 'white',
          size: fontSizeToSize(el.fontSize ?? 24),
          font: 'draw',
          textAlign: alignToTextAlign(el.align ?? 'left'),
          w: el.width,
          autoSize: true,
          scale: 1,
        },
      });
    } else if (el.type === 'image' && el.imageSrc) {
      editor.createShape({
        id,
        type: 'image',
        x: el.x,
        y: el.y,
        rotation: (el.rotation * Math.PI) / 180,
        opacity,
        isLocked: el.locked,
        meta,
        props: {
          w: el.width,
          h: el.height,
          assetId: null,
          playing: false,
          url: el.imageSrc,
          crop: null,
          flipX: false,
          flipY: false,
          altText: el.imagePath ?? el.name,
        },
      });
    }
  }
}
