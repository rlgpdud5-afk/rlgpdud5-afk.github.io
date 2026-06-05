import { Route, Routes, useParams } from 'react-router-dom';
import { CrewPage, CrewVerifyPage } from './CrewPage';
import { PortfolioSharePage } from './PortfolioSharePage';

function VerifyRoute() {
  const { verifyId } = useParams();
  return <CrewVerifyPage verifyId={verifyId || ''} />;
}

export function CrewRoutes() {
  return (
    <Routes>
      <Route index element={<CrewPage />} />
      <Route path="portfolio" element={<PortfolioSharePage />} />
      <Route path="verify/:verifyId" element={<VerifyRoute />} />
    </Routes>
  );
}
