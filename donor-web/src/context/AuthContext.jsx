import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [donor, setDonor] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('donor_token') || null);
  const [loading, setLoading] = useState(true);

  // Load user data on mount
  useEffect(() => {
    async function loadUser() {
      const storedToken = localStorage.getItem('donor_token');
      if (storedToken) {
        try {
          const res = await api.get('/donors/me');
          if (res.data.success) {
            setDonor(res.data.donor);
            localStorage.setItem('donor_data', JSON.stringify(res.data.donor));
          }
        } catch (err) {
          console.error('Failed to load donor profile:', err);
          localStorage.removeItem('donor_token');
          localStorage.removeItem('donor_data');
          setDonor(null);
          setToken(null);
        }
      }
      setLoading(false);
    }
    loadUser();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      setToken(res.data.token);
      setDonor(res.data.donor);
      localStorage.setItem('donor_token', res.data.token);
      localStorage.setItem('donor_data', JSON.stringify(res.data.donor));
    }
    return res.data;
  };

  const register = async (formData) => {
    const res = await api.post('/auth/register', formData);
    if (res.data.success) {
      setToken(res.data.token);
      setDonor(res.data.donor);
      localStorage.setItem('donor_token', res.data.token);
      localStorage.setItem('donor_data', JSON.stringify(res.data.donor));
    }
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('donor_token');
    localStorage.removeItem('donor_data');
    setToken(null);
    setDonor(null);
  };

  const updateAvailability = async (newStatus) => {
    const res = await api.put('/donors/me/availability', { availability_status: newStatus });
    if (res.data.success) {
      setDonor(prev => prev ? { ...prev, availability_status: newStatus } : null);
    }
    return res.data;
  };

  const updateProfile = async (updatedData) => {
    const res = await api.put('/donors/me', updatedData);
    if (res.data.success) {
      setDonor(res.data.donor);
      localStorage.setItem('donor_data', JSON.stringify(res.data.donor));
    }
    return res.data;
  };

  const refreshDonor = async () => {
    try {
      const res = await api.get('/donors/me');
      if (res.data.success) {
        setDonor(res.data.donor);
        localStorage.setItem('donor_data', JSON.stringify(res.data.donor));
      }
    } catch (err) {
      console.error('Error refreshing donor profile:', err);
    }
  };

  return (
    <AuthContext.Provider value={{
      donor,
      token,
      loading,
      isAuthenticated: !!donor,
      login,
      register,
      logout,
      updateAvailability,
      updateProfile,
      refreshDonor
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
