import { forwardRef } from 'react';
import { DesignEditorPage, type DesignEditorHandle } from '../design-editor/DesignEditorPage';

export const DesignPanel = forwardRef<
  DesignEditorHandle,
  { taskId: string; onToast: (msg: string) => void }
>(function DesignPanel({ taskId, onToast }, ref) {
  return <DesignEditorPage ref={ref} taskId={taskId} onToast={onToast} />;
});
