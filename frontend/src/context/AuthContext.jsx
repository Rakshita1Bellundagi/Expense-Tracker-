import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser } from '../api/client';
import { getApiError } from '../utils/helpers';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('auth_token') || null);
  const [loading, setLoading] = useState(false);

  const saveAuthSession = (userData, tokenString) => {
    setUser(userData);
    setToken(tokenString);
    localStorage.setItem('auth_user', JSON.stringify(userData));
    localStorage.setItem('auth_token', tokenString);
  };

  const clearAuthSession = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await loginUser({ email, password });
      if (res.success) {
        saveAuthSession(res.user, res.token);
        toast.success(`Welcome back, ${res.user.name.split(' ')[0]}!`);
        return { success: true };
      }
      return { success: false, message: res.message };
    } catch (err) {
      const msg = getApiError(err);
      toast.error(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const res = await registerUser({ name, email, password });
      if (res.success) {
        saveAuthSession(res.user, res.token);
        toast.success(`Account created! Welcome, ${res.user.name}!`);
        return { success: true };
      }
      return { success: false, message: res.message };
    } catch (err) {
      const msg = getApiError(err);
      toast.error(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const quickDemoLogin = async () => {
    return login('student@codenova.edu', 'student123');
  };

  const logout = () => {
    clearAuthSession();
    toast.success('Signed out successfully.');
  };

  const value = {
    user,
    token,
    isAuthenticated: Boolean(user),
    loading,
    login,
    register,
    quickDemoLogin,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
