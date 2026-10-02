import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AdminSidebar } from '../components/AdminSidebar';
import { AdminHeader } from '../components/AdminHeader';

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Dynamic header title based on route
  const getPageTitle = (path) => {
    if (path.includes('/dashboard')) return 'Dashboard Overview';
    if (path.includes('/donors/add')) return 'Register New Donor';
    if (path.includes('/donors') && path.includes('/edit')) return 'Edit Donor Profile';
    if (path.includes('/donors/')) return 'Donor Profile & Verification';
    if (path.includes('/donors')) return 'Donor Directory';
    if (path.includes('/registrations')) return 'Registration Requests';
    if (path.includes('/search')) return 'Emergency Donor Search';
    if (path.includes('/donations')) return 'Donation Records Management';
    if (path.includes('/reports')) return 'Analytics & Reporting';
    if (path.includes('/administrators')) return 'Administrator Management';
    if (path.includes('/settings')) return 'System Settings';
    return 'BloodConnect Administration';
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          onMenuClick={() => setSidebarOpen(true)}
          title={getPageTitle(location.pathname)}
        />
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
