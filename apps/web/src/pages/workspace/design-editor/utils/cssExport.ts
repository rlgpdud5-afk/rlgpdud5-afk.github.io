import type { Editor } from 'tldraw';
import { renderPlaintextFromRichText } from 'tldraw';
import { layerNameFromShape, slugifyClass } from '../types/design';
import { sizeToFontPx, textAlignToAlign } from './tldrawHelpers';

const PALETTE: Record<string, string> = {
  black: '#1d1d1d',
  grey: '#9ca3af',
  violet: '#7c6eff',
  blue: '#4465e9',
  yellow: '#ffc034',
  orange: '#ff7c43',
  green: '#099268',
  red: '#e03131',
  white: '#f8f9fa',
};

function colorHex(name: string) {
  return PALETTE[name] ?? '#7c6eff';
}

export function shapesToCss(editor: Editor, date = new Date()): string {
  const lines: string[] = [
    `/* D-GIG CSS Export — ${date.toISOString().slice(0, 10)} */`,
    '',
  ];
  for (const shape of editor.getCurrentPageShapes()) {
    if (shape.isLocked) continue;
    const meta = shape.meta as { hidden?: boolean };
    if (meta?.hidden) continue;

    const bounds = editor.getShapePageBounds(shape);
    if (!bounds) continue;

    const name = layerNameFromShape(shape.meta, shape.id);
    const cls = slugifyClass(name);
    const opacity = shape.opacity ?? 1;
    const rot = shape.rotation ? (shape.rotation * 180) / Math.PI : 0;
    const rotCss = rot ? `  transform: rotate(${rot.toFixed(1)}deg);\n` : '';

    if (shape.type === 'geo') {
      const props = shape.props as {
        geo: string;
        fill: string;
        color: string;
      };
      const fillHex = props.fill === 'none' ? 'transparent' : colorHex(props.color);
      const radius = props.geo === 'ellipse' || props.geo === 'oval' ? '50%' : '8px';
      lines.push(
        `.${cls} {`,
        '  position: absolute;',
        `  left: ${bounds.x.toFixed(0)}px;`,
        `  top: ${bounds.y.toFixed(0)}px;`,
        `  width: ${bounds.w.toFixed(0)}px;`,
        `  height: ${bounds.h.toFixed(0)}px;`,
        `  background: ${fillHex};`,
        `  border-radius: ${radius};`,
        `  opacity: ${opacity};`,
        rotCss.trimEnd(),
        '}',
        '',
      );
    } else if (shape.type === 'text') {
      const props = shape.props as {
        size: 's' | 'm' | 'l' | 'xl';
        color: string;
        textAlign: 'start' | 'middle' | 'end';
        richText: Parameters<typeof renderPlaintextFromRichText>[1];
      };
      const textColor = colorHex(props.color);
      const text = renderPlaintextFromRichText(editor, props.richText);
      lines.push(
        `.${cls} {`,
        '  position: absolute;',
        `  left: ${bounds.x.toFixed(0)}px;`,
        `  top: ${bounds.y.toFixed(0)}px;`,
        `  font-size: ${sizeToFontPx(props.size)}px;`,
        `  color: ${textColor};`,
        `  text-align: ${textAlignToAlign(props.textAlign)};`,
        `  opacity: ${opacity};`,
        rotCss.trimEnd(),
        '}',
        `/* content: ${text.slice(0, 80).replace(/\n/g, ' ')} */`,
        '',
      );
    } else if (shape.type === 'image') {
      const props = shape.props as { altText?: string };
      lines.push(
        `.${cls} {`,
        '  position: absolute;',
        `  left: ${bounds.x.toFixed(0)}px;`,
        `  top: ${bounds.y.toFixed(0)}px;`,
        `  width: ${bounds.w.toFixed(0)}px;`,
        `  height: ${bounds.h.toFixed(0)}px;`,
        '  object-fit: cover;',
        `  opacity: ${opacity};`,
        '}',
        props.altText ? `/* image: ${props.altText} */` : '',
        '',
      );
    }
  }

  return lines.filter(Boolean).join('\n');
}
