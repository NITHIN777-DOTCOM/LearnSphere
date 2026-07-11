import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, AuthResponse, Role } from '../types/index.js';
import { api } from '../services/api.js';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role: Role
  ) => Promise<void>;
  logout: () => void;
  updateUser: (updatedFields: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Validate session on startup
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('learnsphere_token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await api.get<User>('/auth/me');
        setUser(response.data);
      } catch (error) {
        console.error('Failed to validate session token:', error);
        localStorage.removeItem('learnsphere_token');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.post<AuthResponse>('/auth/login', { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('learnsphere_token', token);
      setUser(user);
    } catch (error) {
      localStorage.removeItem('learnsphere_token');
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(
    async (
      email: string,
      password: string,
      firstName: string,
      lastName: string,
      role: Role
    ) => {
      setIsLoading(true);
      try {
        const response = await api.post<AuthResponse>('/auth/register', {
          email,
          password,
          firstName,
          lastName,
          role,
        });
        const { token, user } = response.data;

        localStorage.setItem('learnsphere_token', token);
        setUser(user);
      } catch (error) {
        localStorage.removeItem('learnsphere_token');
        setUser(null);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem('learnsphere_token');
    setUser(null);
  }, []);

  const updateUser = useCallback((updatedFields: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updatedFields } : null));
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
