import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiGet, apiPost, getToken, setToken } from '../api/client';
import type { User } from './types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    void apiGet<{ user: User }>('/me')
      .then((data) => setUser(data.user))
      .catch(() => {
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  async function applyAuth(email: string, password: string, mode: 'login' | 'register'): Promise<void> {
    const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
    const response = await apiPost<{ token: string }>(endpoint, { email, password });
    setToken(response.token);
    const profile = await apiGet<{ user: User }>('/me');
    setUser(profile.user);
  }

  async function applyGoogleAuth(idToken: string): Promise<void> {
    const response = await apiPost<{ token: string }>('/auth/google', { idToken });
    setToken(response.token);
    const profile = await apiGet<{ user: User }>('/me');
    setUser(profile.user);
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      login: (email, password) => applyAuth(email, password, 'login'),
      register: (email, password) => applyAuth(email, password, 'register'),
      loginWithGoogle: (idToken) => applyGoogleAuth(idToken),
      logout: () => {
        setToken(null);
        setUser(null);
      }
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
