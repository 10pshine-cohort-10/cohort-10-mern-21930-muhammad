import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import client from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('notes_auth_token'));
  const [user, setUser] = useState(() => {
    const cached = localStorage.getItem('notes_user_data');
    if (!cached) return null;
    try {
      return JSON.parse(cached);
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(Boolean(token && !user));

  const refreshUser = useCallback(async () => {
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await client.get('/users/me');
      const userData = response.data.data;
      setUser(userData);
      localStorage.setItem('notes_user_data', JSON.stringify(userData));
    } catch (err) {
      console.error('Failed to restore user session:', err);
      setToken(null);
      setUser(null);
      localStorage.removeItem('notes_auth_token');
      localStorage.removeItem('notes_user_data');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token && !user) {
      refreshUser();
    } else {
      setIsLoading(false);
    }
  }, [token, user, refreshUser]);

  const login = async (email, password) => {
    try {
      const response = await client.post('/auth/login', { email, password });
      const { token: receivedToken, user: receivedUser } = response.data.data;

      localStorage.setItem('notes_auth_token', receivedToken);
      localStorage.setItem('notes_user_data', JSON.stringify(receivedUser));
      setToken(receivedToken);
      setUser(receivedUser);
      return receivedUser;
    } catch (err) {
      console.error('Login request failed:', err);
      throw err;
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await client.post('/auth/register', { name, email, password });
      const { token: receivedToken, user: receivedUser } = response.data.data;

      localStorage.setItem('notes_auth_token', receivedToken);
      localStorage.setItem('notes_user_data', JSON.stringify(receivedUser));
      setToken(receivedToken);
      setUser(receivedUser);
      return receivedUser;
    } catch (err) {
      console.error('Registration request failed:', err);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('notes_auth_token');
    localStorage.removeItem('notes_user_data');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    isLoading,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
