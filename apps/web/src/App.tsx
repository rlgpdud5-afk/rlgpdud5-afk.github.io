import type { ReactNode } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ScrollMode } from './components/ScrollMode';
import { DataProvider } from './context/DataContext';
import { I18nProvider } from './context/I18nContext';
import { AuthProvider, useAuth } from './features/auth/AuthProvider';
import { Home } from './pages/Home';
import { LoginPage, SignupPage } from './pages/AuthPage';
import { MatchPage } from './pages/MatchPage';
import { CrewRoutes } from './pages/crew/CrewRoutes';
import { WorkspaceRoutes } from './pages/workspace/WorkspaceRoutes';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { authEnabled, loading, user } = useAuth();

  if (authEnabled && loading) {
    return <div className="loading">로딩 중...</div>;
  }

  if (authEnabled && !user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function PublicAuthRoute({ children }: { children: ReactNode }) {
  const { authEnabled, loading, user } = useAuth();

  if (authEnabled && loading) {
    return <div className="loading">로딩 중...</div>;
  }

  if (authEnabled && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <I18nProvider>
      <AuthProvider>
        <DataProvider>
          <HashRouter>
            <ScrollMode />
            <Routes>
              <Route path="/crew/*" element={<CrewRoutes />} />
              <Route path="/workspace/*" element={<WorkspaceRoutes />} />
              <Route
                path="/*"
                element={
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route
                        path="/dashboard"
                        element={
                          <ProtectedRoute>
                            <MatchPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/gig-match"
                        element={
                          <ProtectedRoute>
                            <MatchPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/match"
                        element={
                          <ProtectedRoute>
                            <MatchPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/login"
                        element={
                          <PublicAuthRoute>
                            <LoginPage />
                          </PublicAuthRoute>
                        }
                      />
                      <Route
                        path="/signup"
                        element={
                          <PublicAuthRoute>
                            <SignupPage />
                          </PublicAuthRoute>
                        }
                      />
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
