import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('admin_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAdmin() {
      const storedToken = localStorage.getItem('admin_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success && res.data.type === 'admin') {
            setAdmin(res.data.user);
            localStorage.setItem('admin_data', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.error('Failed to load admin profile:', err);
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_data');
          setAdmin(null);
          setToken(null);
        }
      }
      setLoading(false);
    }
    loadAdmin();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/admin/login', { email, password });
    if (res.data.success) {
      setToken(res.data.token);
      setAdmin(res.data.admin);
      localStorage.setItem('admin_token', res.data.token);
      localStorage.setItem('admin_data', JSON.stringify(res.data.admin));
    }
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_data');
    setToken(null);
    setAdmin(null);
  };

  const isSuperAdmin = admin?.role === 'SUPER_ADMIN';

  return (
    <AdminAuthContext.Provider value={{
      admin,
      token,
      loading,
      isAuthenticated: !!admin,
      isSuperAdmin,
      login,
      logout
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
