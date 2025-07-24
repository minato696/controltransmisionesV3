'use client';

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  user: string | null;
  error: string | null;
}

// Crear el contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hardcoded credentials (in a real app, this would be on the server)
const VALID_USERNAME = 'exitosa';
const VALID_PASSWORD = '147ABC55';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in on mount
  useEffect(() => {
    // Verify we're in the browser environment before accessing localStorage
    if (typeof window !== 'undefined') {
      const storedAuth = localStorage.getItem('auth');
      if (storedAuth) {
        try {
          const authData = JSON.parse(storedAuth);
          if (authData.isAuthenticated && authData.user) {
            setIsAuthenticated(true);
            setUser(authData.user);
          }
        } catch (e) {
          // Invalid stored data, clear it
          localStorage.removeItem('auth');
        }
      }
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    // Clear any previous errors
    setError(null);
    
    // Simple validation
    if (!username || !password) {
      setError('Por favor ingrese usuario y contraseña');
      return false;
    }
    
    // Simulate API call with a delay
    return new Promise((resolve) => {
      setTimeout(() => {
        if (username === VALID_USERNAME && password === VALID_PASSWORD) {
          setIsAuthenticated(true);
          setUser(username);
          
          // Store auth state in localStorage if in browser environment
          if (typeof window !== 'undefined') {
            localStorage.setItem('auth', JSON.stringify({ 
              isAuthenticated: true, 
              user: username 
            }));
          }
          
          resolve(true);
        } else {
          setError('Usuario o contraseña incorrectos');
          resolve(false);
        }
      }, 500);
    });
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth');
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, user, error }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar el contexto
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};