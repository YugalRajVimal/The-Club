'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  getStoredUserToken,
  setStoredUserToken,
  checkUserAuth,
  userLogin,
  userLoginGoogle,
  userLogout,
} from '@/lib/api/client';
import type { User } from '@/lib/api/types';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setSession: (token: string, user: User) => void;
  login: (email: string, password: string) => Promise<User>;
  loginWithGoogle: (googleIdToken: string) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = getStoredUserToken();
    if (!stored) {
      setIsLoading(false);
      return;
    }
    setToken(stored);
    checkUserAuth()
      .then(({ user: verifiedUser }) => setUser(verifiedUser))
      .catch(() => {
        setStoredUserToken(null);
        setToken(null);
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const setSession = useCallback((newToken: string, newUser: User) => {
    setStoredUserToken(newToken);
    setToken(newToken);
    setUser(newUser);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await userLogin({ email, password });
      setStoredUserToken(res.token);
      setToken(res.token);
      setUser(res.user);
      return res.user;
    },
    []
  );

  const loginWithGoogle = useCallback(async (googleIdToken: string) => {
    const res = await userLoginGoogle({ googleIdToken });
    setStoredUserToken(res.token);
    setToken(res.token);
    setUser(res.user);
    return res.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await userLogout();
    } catch {
      // best-effort — clear locally regardless
    }
    setStoredUserToken(null);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      isLoading,
      setSession,
      login,
      loginWithGoogle,
      logout,
    }),
    [user, token, isLoading, setSession, login, loginWithGoogle, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
