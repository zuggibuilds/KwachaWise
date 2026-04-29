import { Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { PrivateRoute, PublicOnlyRoute } from './routes/AuthRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { KwachawiseV2Page } from './pages/KwachawiseV2Page';

export default function App() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-slate-600">Loading...</div>}>
      <Routes>
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route element={<PrivateRoute />}>
          <Route path="/*" element={<KwachawiseV2Page />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
