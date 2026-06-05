import type { Editor, TLShape } from 'tldraw';
import {
  DefaultColorStyle,
  GeoShapeGeoStyle,
  renderPlaintextFromRichText,
  toRichText,
  type TLDefaultColorStyle,
  type TLGeoShapeGeoStyle,
} from 'tldraw';
import {
  alignToTextAlign,
  fontSizeToSize,
  shapeDisplayName,
  sizeToFontPx,
  textAlignToAlign,
} from '../utils/tldrawHelpers';

const COLORS = ['black', 'grey', 'violet', 'blue', 'yellow', 'orange', 'green', 'red', 'white'];

function Num({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <label className="de-prop-row">
      <span>{label}</span>
      <input
        type="number"
        value={Math.round(value)}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}

export function PropertiesPanel({
  editor,
  shape,
}: {
  editor: Editor | null;
  shape: TLShape | null;
}) {
  if (!editor || !shape) {
    return (
      <aside className="de-props-panel">
        <div className="de-panel-head">Properties</div>
        <p className="de-props-empty">요소를 선택하세요</p>
      </aside>
    );
  }

  const bounds = editor.getShapePageBounds(shape);
  const x = shape.x;
  const y = shape.y;
  const w = bounds?.w ?? (shape.props as { w?: number }).w ?? 0;
  const h = bounds?.h ?? (shape.props as { h?: number }).h ?? 0;
  const opacityPct = Math.round((shape.opacity ?? 1) * 100);
  const rotationDeg = Math.round(((shape.rotation ?? 0) * 180) / Math.PI);

  const patch = (partial: Record<string, unknown>) => {
    editor.updateShape({ id: shape.id, type: shape.type, ...partial });
  };

  const patchProps = (delta: Record<string, unknown>) => {
    editor.updateShape({
      id: shape.id,
      type: shape.type,
      props: { ...(shape.props as object), ...delta },
    });
  };

  return (
    <aside className="de-props-panel">
      <div className="de-panel-head">Properties</div>
      <div className="de-props-body">
        <p className="de-prop-type">{shapeDisplayName(shape)}</p>
        <Num label="X" value={x} onChange={(nx) => patch({ x: nx })} />
        <Num label="Y" value={y} onChange={(ny) => patch({ y: ny })} />
        <Num
          label="W"
          value={w}
          onChange={(nw) => {
            if (shape.type === 'geo' || shape.type === 'image') patchProps({ w: nw });
            else if (shape.type === 'text') patchProps({ w: nw });
          }}
        />
        <Num
          label="H"
          value={h}
          onChange={(nh) => {
            if (shape.type === 'geo' || shape.type === 'image') patchProps({ h: nh });
          }}
        />
        <label className="de-prop-row">
          <span>Opacity</span>
          <input
            type="range"
            min={0}
            max={100}
            value={opacityPct}
            onChange={(e) => patch({ opacity: Number(e.target.value) / 100 })}
          />
          <span>{opacityPct}%</span>
        </label>
        <Num
          label="Rotation"
          value={rotationDeg}
          onChange={(deg) => patch({ rotation: (deg * Math.PI) / 180 })}
        />

        {shape.type === 'geo' && (
          <>
            <label className="de-prop-row">
              <span>Color</span>
              <select
                value={(shape.props as { color: string }).color}
                onChange={(e) => {
                  const c = e.target.value as TLDefaultColorStyle;
                  editor.setStyleForSelectedShapes(DefaultColorStyle, c);
                  patchProps({ color: c });
                }}
              >
                {COLORS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="de-prop-row">
              <span>Geo</span>
              <select
                value={(shape.props as { geo: string }).geo}
                onChange={(e) => {
                  const geo = e.target.value as TLGeoShapeGeoStyle;
                  editor.setStyleForSelectedShapes(GeoShapeGeoStyle, geo);
                  patchProps({ geo });
                }}
              >
                <option value="rectangle">rectangle</option>
                <option value="ellipse">ellipse</option>
              </select>
            </label>
          </>
        )}

        {shape.type === 'text' && (
          <>
            <label className="de-prop-row de-prop-row--col">
              <span>Text</span>
              <textarea
                value={renderPlaintextFromRichText(
                  editor,
                  (shape.props as { richText: Parameters<typeof renderPlaintextFromRichText>[1] })
                    .richText,
                )}
                onChange={(e) => patchProps({ richText: toRichText(e.target.value) })}
              />
            </label>
            <Num
              label="Font size"
              value={sizeToFontPx((shape.props as { size: 's' | 'm' | 'l' | 'xl' }).size)}
              onChange={(px) => patchProps({ size: fontSizeToSize(px) })}
            />
            <label className="de-prop-row">
              <span>Color</span>
              <select
                value={(shape.props as { color: string }).color}
                onChange={(e) => patchProps({ color: e.target.value })}
              >
                {COLORS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="de-prop-row">
              <span>Align</span>
              <select
                value={textAlignToAlign((shape.props as { textAlign: 'start' | 'middle' | 'end' }).textAlign)}
                onChange={(e) =>
                  patchProps({ textAlign: alignToTextAlign(e.target.value) })
                }
              >
                <option value="left">L</option>
                <option value="center">C</option>
                <option value="right">R</option>
              </select>
            </label>
          </>
        )}

        {shape.type === 'image' && (
          <>
            <p className="de-prop-path">
              {(shape.props as { altText?: string }).altText || '(image)'}
            </p>
            <label className="de-prop-row">
              <span>Replace</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => {
                    patchProps({ url: String(reader.result), altText: file.name });
                  };
                  reader.readAsDataURL(file);
                }}
              />
            </label>
          </>
        )}
      </div>
    </aside>
  );
}
