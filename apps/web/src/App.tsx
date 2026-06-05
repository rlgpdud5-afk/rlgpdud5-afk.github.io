import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { I18nProvider } from './context/I18nContext';
import { Home } from './pages/Home';
import { LoginPage, SignupPage } from './pages/AuthPage';
import { MatchPage } from './pages/MatchPage';
import { CrewRoutes } from './pages/crew/CrewRoutes';
import { WorkspaceRoutes } from './pages/workspace/WorkspaceRoutes';

export default function App() {
  return (
    <I18nProvider>
      <AuthProvider>
        <DataProvider>
          <HashRouter>
          <Routes>
            <Route path="/crew/*" element={<CrewRoutes />} />
            <Route path="/workspace/*" element={<WorkspaceRoutes />} />
            <Route
              path="/*"
              element={
                <Layout>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/match" element={<MatchPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Layout>
              }
            />
          </Routes>
          </HashRouter>
        </DataProvider>
      </AuthProvider>
    </I18nProvider>
  );
}
