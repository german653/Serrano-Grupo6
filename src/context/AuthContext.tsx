import React, { createContext, useContext, useState } from 'react';
import { api } from '../lib/api';
import type { User, UserRole } from '../types';

interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  loginDemo: (role: UserRole) => Promise<User>;
  register: (payload: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    phone: string;
    city: string;
  }) => Promise<User>;
  logout: () => void;
}

const STORAGE_KEY = 'serrano_reservas_user_v1';

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  });

  const persistUser = (nextUser: User | null) => {
    setUser(nextUser);
    try {
      if (nextUser) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // Ignore storage quota issues
    }
  };

  const login = async (email: string, password: string) => {
    const res = await api.login(email, password);
    persistUser(res.user);
    return res.user;
  };

  const loginDemo = async (role: UserRole) => {
    const res = await api.loginDemo(role);
    persistUser(res.user);
    return res.user;
  };

  const register = async (payload: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    phone: string;
    city: string;
  }) => {
    const res = await api.register(payload);
    persistUser(res.user);
    return res.user;
  };

  const logout = () => {
    persistUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, loginDemo, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe utilizarse dentro de AuthProvider.');
  }
  return ctx;
}
