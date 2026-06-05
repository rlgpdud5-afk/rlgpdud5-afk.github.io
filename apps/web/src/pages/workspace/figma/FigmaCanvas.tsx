import { useState } from 'react';
import type { DesignTool } from '../../../lib/workspace/store';
import { FIGMA_LAYER_ROWS, type FigmaLayerId } from './layers';
import { FigmaProductCard } from './FigmaProductCard';
import './tokens.css';
import './figma-product-card.css';

export function FigmaCanvas({
  zoom,
  designTool,
  toolsLabel,
  figmaKeys,
  canvasHint,
  title,
  description,
  buttonLabel,
  mediaAlt,
  onTool,
}: {
  zoom: number;
  designTool: DesignTool;
  toolsLabel: string;
  figmaKeys: string;
  canvasHint: string;
  title: string;
  description: string;
  buttonLabel: string;
  mediaAlt: string;
  onTool: (t: DesignTool) => void;
}) {
  const [selectedLayerId, setSelectedLayerId] = useState<FigmaLayerId>('frame-product-card');

  return (
    <div className="ws-canvas-area">
      <div className="ws-layers" role="tree" aria-label="Layers">
        {FIGMA_LAYER_ROWS.map(({ id, label, depth }) => (
          <div
            key={id}
            role="treeitem"
            className={
              'ws-layer' +
              (selectedLayerId === id ? ' figma-layer-row--selected on' : '')
            }
            style={{ paddingLeft: 12 + depth * 12 }}
            onClick={() => setSelectedLayerId(id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') setSelectedLayerId(id);
            }}
            tabIndex={0}
          >
            {label}
          </div>
        ))}
      </div>

      <div className="ws-canvas ws-canvas--figma">
        <div
          className="figma-canvas-stage"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
        >
          <FigmaProductCard
            title={title}
            description={description}
            buttonLabel={buttonLabel}
            mediaAlt={mediaAlt}
            selectedLayerId={selectedLayerId}
            onSelectLayer={setSelectedLayerId}
          />
        </div>
        <p className="figma-canvas-hint">{canvasHint}</p>
      </div>

      <div className="ws-props">
        <h4>{toolsLabel}</h4>
        <div className="ws-tool-row">
          {(['select', 'frame', 'rect', 'text'] as const).map((tool) => (
            <button
              key={tool}
              type="button"
              className={'ws-tool' + (designTool === tool ? ' on' : '')}
              onClick={() => onTool(tool)}
            >
              {tool[0].toUpperCase()}
            </button>
          ))}
        </div>
        <p className="figma-props-layer">
          <span className="figma-props-label">Layer</span>
          {FIGMA_LAYER_ROWS.find((r) => r.id === selectedLayerId)?.label}
        </p>
        <p className="figma-props-keys">{figmaKeys}</p>
      </div>
    </div>
  );
}
