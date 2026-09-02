import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, getCurrentUser } from '../api/borderoApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('indore_auth_token'));
  const [loading, setLoading] = useState(true);

  // Verifikasi token saat inisialisasi aplikasi
  useEffect(() => {
    async function verifyAuth() {
      const storedToken = localStorage.getItem('indore_auth_token');
      if (storedToken) {
        try {
          const userData = await getCurrentUser();
          setUser(userData);
        } catch (err) {
          console.warn('Token tidak valid atau telah kedaluwarsa:', err);
          localStorage.removeItem('indore_auth_token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    }
    verifyAuth();
  }, []);

  const login = async (username, password) => {
    const res = await loginUser(username, password);
    if (res && res.access_token) {
      localStorage.setItem('indore_auth_token', res.access_token);
      setToken(res.access_token);
      setUser(res.user);
      return res;
    }
    throw new Error('Gagal mendapatkan token autentikasi.');
  };

  const loginSSO = async (provider, profileData = {}) => {
    const payload = {
      provider,
      email: profileData.email,
      full_name: profileData.full_name || profileData.name || 'User SSO',
      avatar_url: profileData.avatar_url || profileData.picture || null,
      id_token: profileData.id_token || null,
    };
    const res = await loginSSOUser(payload);
    if (res && res.access_token) {
      localStorage.setItem('indore_auth_token', res.access_token);
      setToken(res.access_token);
      setUser(res.user);
      return res;
    }
    throw new Error('Gagal melakukan autentikasi SSO.');
  };

  const logout = () => {
    localStorage.removeItem('indore_auth_token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'admin',
    loading,
    login,
    loginSSO,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
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
