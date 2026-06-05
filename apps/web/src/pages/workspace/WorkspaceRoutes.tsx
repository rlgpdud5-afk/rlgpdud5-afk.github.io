import { Route, Routes } from 'react-router-dom';
import { WorkspacePage } from './WorkspacePage';

export function WorkspaceRoutes() {
  return (
    <Routes>
      <Route index element={<WorkspacePage />} />
    </Routes>
  );
}
