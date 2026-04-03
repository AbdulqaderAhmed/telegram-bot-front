'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';

interface User {
  id: string;
  username: string;
  fullname: string;
  role: string;
  workunit: string;
}

interface AuthContextType {
  user: User | null;
  login: (data: any) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = Cookies.get('user');
    const token = Cookies.get('token');
    const expiresAt = Cookies.get('token_expires_at');

    const isExpired = expiresAt ? new Date() > new Date(expiresAt) : false;

    if (storedUser && token && !isExpired) {
      setUser(JSON.parse(storedUser));
    } else if (isExpired) {
      Cookies.remove('token');
      Cookies.remove('user');
      Cookies.remove('token_expires_at');
    }
    setIsLoading(false);

    // Check expiry every minute while the tab is open
    const interval = setInterval(() => {
      const exp = Cookies.get('token_expires_at');
      if (exp && new Date() > new Date(exp)) {
        Cookies.remove('token');
        Cookies.remove('user');
        Cookies.remove('token_expires_at');
        setUser(null);
        router.push('/login');
      }
    }, 60_000);

    return () => clearInterval(interval);
  }, []);

  const login = (data: any) => {
    const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000); // 8 hours from now
    Cookies.set('token', data.access_token, { expires: expiresAt });
    Cookies.set('user', JSON.stringify(data.user), { expires: expiresAt });
    Cookies.set('token_expires_at', expiresAt.toISOString(), { expires: expiresAt });
    setUser(data.user);
    router.push('/dashboard');
  };

  const logout = () => {
    Cookies.remove('token');
    Cookies.remove('user');
    Cookies.remove('token_expires_at');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
