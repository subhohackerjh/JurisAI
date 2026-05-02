'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthSession } from '@/lib/types';
import { authApi } from '@/lib/api';

interface AuthContextType {
  session: AuthSession;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession>({
    user: null,
    isAuthenticated: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedSession = localStorage.getItem('authSession');
    console.log('[Auth] Initializing AuthContext, checking saved session...');
    console.log('[Auth] Saved session exists:', !!savedSession);
    
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        console.log('[Auth] Parsed session:', {
          isAuthenticated: parsed.isAuthenticated,
          user: parsed.user?.email,
          hasAccessToken: !!parsed.accessToken,
          hasRefreshToken: !!parsed.refreshToken
        });
        setSession(parsed);
      } catch (error) {
        console.error('[Auth] Failed to parse saved session:', error);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    console.log('[Auth] Starting login process for:', email);
    setIsLoading(true);

    try {
      const response = await authApi.login(email, password);
      console.log('[Auth] Login API response:', response.error ? 'ERROR' : 'SUCCESS');

      if (response.error || !response.data) {
        console.log('[Auth] Login failed:', response.error);
        setIsLoading(false);
        throw new Error(response.error || 'Login failed');
      }

      const { access, refresh, user } = response.data as any;
      console.log('[Auth] Login successful, creating session for:', user.email, user.role);

      const newSession: AuthSession = {
        user,
        isAuthenticated: true,
        accessToken: access,
        refreshToken: refresh,
      };

      console.log('[Auth] Setting session state and storing in localStorage');
      setSession(newSession);
      localStorage.setItem('authSession', JSON.stringify(newSession));
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
      console.log('[Auth] Session stored successfully');
      setIsLoading(false);
    } catch (error) {
      console.log('[Auth] Login error:', error);
      setIsLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch (error) {
      console.error('[Auth] Logout error:', error);
    } finally {
      setSession({ user: null, isAuthenticated: false });
      localStorage.removeItem('authSession');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  };

  return (
    <AuthContext.Provider value={{ session, user: session.user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
