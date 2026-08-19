import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { resetSocket, disconnectSocket } from '../services/socket';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('devsync_token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user on mount if token exists
  useEffect(() => {
    async function loadCurrentUser() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.getMe();
        if (response.success && response.user) {
          setUser(response.user);
        } else {
          logout();
        }
      } catch (err) {
        console.warn('[AuthContext] Failed to load user:', err.message);
        logout();
      } finally {
        setLoading(false);
      }
    }

    loadCurrentUser();
  }, [token]);

  const login = async (credentials) => {
    try {
      setError(null);
      const res = await api.login(credentials);
      if (res.success && res.token) {
        localStorage.setItem('devsync_token', res.token);
        setToken(res.token);
        setUser(res.user);
        resetSocket();
        return { success: true };
      }
      return { success: false, message: res.message };
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  const signup = async (userData) => {
    try {
      setError(null);
      const res = await api.signup(userData);
      if (res.success && res.token) {
        localStorage.setItem('devsync_token', res.token);
        setToken(res.token);
        setUser(res.user);
        resetSocket();
        return { success: true };
      }
      return { success: false, message: res.message };
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('devsync_token');
    setToken(null);
    setUser(null);
    disconnectSocket();
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await api.updateProfile(profileData);
      if (res.success && res.user) {
        setUser(res.user);
        return { success: true, user: res.user };
      }
      return { success: false, message: res.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loading,
        error,
        login,
        signup,
        logout,
        updateProfile,
      }}
    >
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
