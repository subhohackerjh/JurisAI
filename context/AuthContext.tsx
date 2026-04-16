'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthSession } from '@/lib/types';
import {
  mockAdvocates,
  mockCitizens,
  mockPoliceOfficers,
} from '@/lib/mock-data';

interface AuthContextType {
  session: AuthSession;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
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
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        setSession(parsed);
      } catch (error) {
        console.error('[v0] Failed to parse saved session:', error);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);

    const allUsers = [
      ...mockAdvocates,
      ...mockCitizens,
      ...mockPoliceOfficers,
      {
        id: 'admin-1',
        name: 'Admin User',
        email: 'admin@legalconnect.com',
        role: 'admin' as const,
        createdAt: '2024-01-01',
      },
    ];

    const user = allUsers.find(
      (u) => u.email === email && password === 'password'
    ) as User | undefined;

    if (!user) {
      setIsLoading(false);
      throw new Error('Invalid credentials');
    }

    const newSession: AuthSession = {
      user,
      isAuthenticated: true,
    };

    setSession(newSession);
    localStorage.setItem('authSession', JSON.stringify(newSession));
    setIsLoading(false);
  };

  const logout = () => {
    setSession({ user: null, isAuthenticated: false });
    localStorage.removeItem('authSession');
  };

  return (
    <AuthContext.Provider value={{ session, login, logout, isLoading }}>
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
