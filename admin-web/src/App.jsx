import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import { AdminLayout } from './layouts/AdminLayout';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { DonorsListPage } from './pages/DonorsListPage';
import { DonorDetailsPage } from './pages/DonorDetailsPage';
import { DonorFormPage } from './pages/DonorFormPage';
import { RegistrationRequestsPage } from './pages/RegistrationRequestsPage';
import { DonationsPage } from './pages/DonationsPage';
import { SearchDonorsPage } from './pages/SearchDonorsPage';
import { ReportsPage } from './pages/ReportsPage';
import { AdministratorsPage } from './pages/AdministratorsPage';
import { SettingsPage } from './pages/SettingsPage';
import { Loader2 } from 'lucide-react';

function ProtectedAdminRoute({ children }) {
  const { isAuthenticated, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Loader2 className="w-8 h-8 text-crimson-500 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

function PublicAdminRoute({ children }) {
  const { isAuthenticated, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Loader2 className="w-8 h-8 text-crimson-500 animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
}

export function App() {
  return (
    <AdminAuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public login */}
          <Route
            path="/admin/login"
            element={
              <PublicAdminRoute>
                <AdminLoginPage />
              </PublicAdminRoute>
            }
          />
          <Route path="/login" element={<Navigate to="/admin/login" replace />} />

          {/* Protected admin portal routes */}
          <Route
            path="/admin"
            element={
              <ProtectedAdminRoute>
                <AdminLayout />
              </ProtectedAdminRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="donors" element={<DonorsListPage />} />
            <Route path="donors/add" element={<DonorFormPage />} />
            <Route path="donors/:id" element={<DonorDetailsPage />} />
            <Route path="donors/:id/edit" element={<DonorFormPage />} />
            <Route path="registrations" element={<RegistrationRequestsPage />} />
            <Route path="search" element={<SearchDonorsPage />} />
            <Route path="donations" element={<DonationsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="administrators" element={<AdministratorsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Root redirect */}
          <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AdminAuthProvider>
  );
}

export default App;
