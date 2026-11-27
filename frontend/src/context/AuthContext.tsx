import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import client from '../api/client';
import { syncGuestNotesIfAny } from '../utils/guestSync';
import type { User, AuthContextValue, ApiResponse, AuthResponseData } from '../types';

const AuthContext = createContext<AuthContextValue | null>(null);

export interface AuthProviderProps {
  children: ReactNode;
}

export const GUEST_SYNC_COUNT_KEY = 'pinnate_synced_guest_count';
export const GUEST_SYNC_ERROR_KEY = 'pinnate_guest_sync_error';

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('notes_auth_token'));
  const currentTokenRef = useRef<string | null>(token);

  const [user, setUser] = useState<User | null>(() => {
    const cached = localStorage.getItem('notes_user_data');
    if (!cached) return null;
    try {
      return JSON.parse(cached) as User;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(token && !user));

  useEffect(() => {
    currentTokenRef.current = token;
  }, [token]);

  const refreshUser = useCallback(async (): Promise<void> => {
    const sessionToken = token;
    if (!sessionToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await client.get<ApiResponse<User>>('/users/me');
      const userData = response.data.data;
      if (currentTokenRef.current === sessionToken && userData) {
        setUser(userData);
        localStorage.setItem('notes_user_data', JSON.stringify(userData));
      }
    } catch (err) {
      console.error('Failed to restore user session:', err);
      if (currentTokenRef.current === sessionToken) {
        currentTokenRef.current = null;
        setToken(null);
        setUser(null);
        localStorage.removeItem('notes_auth_token');
        localStorage.removeItem('notes_user_data');
      }
    } finally {
      if (currentTokenRef.current === sessionToken) {
        setIsLoading(false);
      }
    }
  }, [token]);

  useEffect(() => {
    if (token && !user) {
      refreshUser();
    } else {
      setIsLoading(false);
    }
  }, [token, user, refreshUser]);

  const persistSessionAndSyncGuestNotes = async (receivedToken: string, receivedUser: User): Promise<User> => {
    currentTokenRef.current = receivedToken;
    localStorage.setItem('notes_auth_token', receivedToken);
    localStorage.setItem('notes_user_data', JSON.stringify(receivedUser));
    setToken(receivedToken);
    setUser(receivedUser);

    const { syncedCount, hasError } = await syncGuestNotesIfAny(receivedToken);
    try {
      if (syncedCount > 0) {
        sessionStorage.setItem(GUEST_SYNC_COUNT_KEY, String(syncedCount));
      }
      if (hasError) {
        sessionStorage.setItem(GUEST_SYNC_ERROR_KEY, 'true');
      }
    } catch {
      // Ignore storage restrictions
    }
    return receivedUser;
  };

  const login = async (email: string, password: string): Promise<User> => {
    try {
      const response = await client.post<ApiResponse<AuthResponseData>>('/auth/login', { email, password });
      const { token: receivedToken, user: receivedUser } = response.data.data!;
      return persistSessionAndSyncGuestNotes(receivedToken, receivedUser);
    } catch (err) {
      console.error('Login request failed:', err);
      throw err;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<User> => {
    try {
      const response = await client.post<ApiResponse<AuthResponseData>>('/auth/register', { name, email, password });
      const { token: receivedToken, user: receivedUser } = response.data.data!;
      return persistSessionAndSyncGuestNotes(receivedToken, receivedUser);
    } catch (err) {
      console.error('Registration request failed:', err);
      throw err;
    }
  };

  const logout = (): void => {
    currentTokenRef.current = null;
    localStorage.removeItem('notes_auth_token');
    localStorage.removeItem('notes_user_data');
    localStorage.removeItem('notes_known_tags');
    localStorage.removeItem('notes_custom_folders');
    setToken(null);
    setUser(null);
  };

  const value: AuthContextValue = {
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

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
