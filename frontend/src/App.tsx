import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthLayout } from './components/layout/AuthLayout';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { GeneratorPage } from './pages/app/GeneratorPage';
import { VideosPage } from './pages/app/VideosPage';
import { VideoDetailPage } from './pages/app/VideoDetailPage';
import { AssetsPage } from './pages/app/AssetsPage';
import { TemplatesPage } from './pages/app/TemplatesPage';
import { TemplateDetailPage } from './pages/app/TemplateDetailPage';
import { ScheduledPage } from './pages/app/ScheduledPage';
import { ApiKeysPage } from './pages/app/ApiKeysPage';
import { SettingsPage } from './pages/app/SettingsPage';
import { HelpPage } from './pages/app/HelpPage';
import { SearchPage } from './pages/app/SearchPage';
import { PricingPage } from './pages/PricingPage';
import { LandingPage } from './pages/LandingPage';
import { useAuthStore } from './store/authStore';
import { authApi } from './services/endpoints';
import { ApiError } from './services/api';

function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);
  const location = useLocation();

  useEffect(() => {
    if (!token || user) return;
    let mounted = true;
    (async () => {
      try {
        const { user: me } = await authApi.me();
        if (mounted) setUser(me);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) logout();
      }
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, location.pathname]);

  return <>{children}</>;
}

export default function App() {
  return (
    <AuthBootstrap>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/pricing" element={<PricingPage />} />

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/app" element={<GeneratorPage />} />
            <Route path="/app/videos" element={<VideosPage />} />
            <Route path="/app/videos/:id" element={<VideoDetailPage />} />
            <Route path="/app/assets" element={<AssetsPage />} />
            <Route path="/app/templates" element={<TemplatesPage />} />
            <Route path="/app/templates/:id" element={<TemplateDetailPage />} />
            <Route path="/app/scheduled" element={<ScheduledPage />} />
            <Route path="/app/api" element={<ApiKeysPage />} />
            <Route path="/app/settings" element={<SettingsPage />} />
            <Route path="/app/help" element={<HelpPage />} />
            <Route path="/app/search" element={<SearchPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthBootstrap>
  );
}
