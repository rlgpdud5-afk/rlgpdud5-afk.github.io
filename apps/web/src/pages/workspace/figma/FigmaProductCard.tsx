import type { FigmaLayerId } from './layers';

export type FigmaProductCardProps = {
  title: string;
  description: string;
  buttonLabel: string;
  mediaAlt: string;
  selectedLayerId: FigmaLayerId | null;
  onSelectLayer: (id: FigmaLayerId) => void;
};

function layerProps(
  id: FigmaLayerId,
  selected: FigmaLayerId | null,
  onSelect: (id: FigmaLayerId) => void,
) {
  return {
    'data-layer-id': id,
    'data-selected': selected === id ? '' : undefined,
    onClick: (e: React.MouseEvent) => {
      e.stopPropagation();
      onSelect(id);
    },
  };
}

export function FigmaProductCard({
  title,
  description,
  buttonLabel,
  mediaAlt,
  selectedLayerId,
  onSelectLayer,
}: FigmaProductCardProps) {
  const sel = selectedLayerId;
  const lp = (id: FigmaLayerId) => layerProps(id, sel, onSelectLayer);

  return (
    <article
      className="frame-product-card figma-canvas-viewport"
      {...lp('frame-product-card')}
    >
      <div className="group-header" {...lp('group-header')}>
        <p className="text-title" {...lp('text-title')}>
          {title}
        </p>
      </div>

      <div className="frame-media" {...lp('frame-media')}>
        {/* icon: image-placeholder, 312×160 */}
        <img
          className="frame-media__img"
          src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='312' height='160' viewBox='0 0 312 160'%3E%3Crect width='312' height='160' fill='%23F3F4F6'/%3E%3C/svg%3E"
          width={312}
          height={160}
          alt={mediaAlt}
        />
      </div>

      <p className="text-description" {...lp('text-description')}>
        {description}
      </p>

      <button type="button" className="component-button" {...lp('component-button')}>
        <span className="text-button-label">{buttonLabel}</span>
      </button>
    </article>
  );
}
