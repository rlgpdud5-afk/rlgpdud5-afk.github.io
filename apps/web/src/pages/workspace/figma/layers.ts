/** Layer tree — names match Figma (kebab-case in CSS). */

export type FigmaLayerId =
  | 'frame-product-card'
  | 'group-header'
  | 'text-title'
  | 'frame-media'
  | 'text-description'
  | 'component-button'
  | 'text-button-label';

export type FigmaLayerRow = {
  id: FigmaLayerId;
  label: string;
  depth: number;
};

export const FIGMA_LAYER_ROWS: FigmaLayerRow[] = [
  { id: 'frame-product-card', label: 'Frame · Product card', depth: 0 },
  { id: 'group-header', label: 'Group · Header', depth: 1 },
  { id: 'text-title', label: 'Text · Title', depth: 2 },
  { id: 'frame-media', label: 'Frame · Media', depth: 1 },
  { id: 'text-description', label: 'Text · Description', depth: 1 },
  { id: 'component-button', label: 'Component · Button', depth: 1 },
  { id: 'text-button-label', label: 'Text · Button label', depth: 2 },
];
