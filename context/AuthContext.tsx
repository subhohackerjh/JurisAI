'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, AuthSession } from '@/lib/types';
import { authApi, profileApi } from '@/lib/api';

interface AuthContextType {
  session: AuthSession;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updated: Partial<User>) => void;  // sync profile changes into session
  refreshUser: () => Promise<void>;              // re-fetch full profile from backend
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession>({
    user: null,
    isAuthenticated: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  // ── Restore session from localStorage on mount ─────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem('authSession');
    if (saved) {
      try {
        setSession(JSON.parse(saved));
      } catch {
        localStorage.removeItem('authSession');
      }
    }
    setIsLoading(false);
  }, []);

  // ── Persist session changes ────────────────────────────────────────────────
  const persist = (s: AuthSession) => {
    setSession(s);
    localStorage.setItem('authSession', JSON.stringify(s));
  };

  // ── updateUser: merge partial profile update into stored session ───────────
  const updateUser = useCallback((updated: Partial<User>) => {
    setSession(prev => {
      if (!prev.user) return prev;
      const next = { ...prev, user: { ...prev.user, ...updated } };
      localStorage.setItem('authSession', JSON.stringify(next));
      return next;
    });
  }, []);

  // ── refreshUser: fetch fresh profile from backend and sync ─────────────────
  const refreshUser = useCallback(async () => {
    try {
      const res = await profileApi.getProfile();
      if (res.data) {
        updateUser(res.data as User);
      }
    } catch {
      // Non-fatal — stale session is fine if network fails
    }
  }, [updateUser]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(email, password);
      if (response.error || !response.data) {
        throw new Error(response.error || 'Login failed');
      }

      const { access, refresh, user } = response.data as any;

      const newSession: AuthSession = {
        user,
        isAuthenticated: true,
        accessToken: access,
        refreshToken: refresh,
      };
      persist(newSession);
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);

      // Fetch full profile so advocate fields (enrollment_number, bar_council, etc.) are populated
      try {
        const profileRes = await profileApi.getProfile();
        if (profileRes.data) {
          const fullUser = { ...user, ...(profileRes.data as User) };
          persist({ ...newSession, user: fullUser });
        }
      } catch {
        // Fine — use login-only data
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) await authApi.logout(refreshToken);
    } catch {
      // ignore
    } finally {
      setSession({ user: null, isAuthenticated: false });
      localStorage.removeItem('authSession');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  };

  return (
    <AuthContext.Provider value={{ session, user: session.user, login, logout, updateUser, refreshUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
