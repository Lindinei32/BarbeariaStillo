// app/_context/AuthContext.tsx
"use client";

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

// A "forma" dos dados do usuário
interface User {
  userId: string;
  name: string;
  email: string;
  isAdmin: boolean;
  image?: string;
}

// O que o nosso contexto vai fornecer para os componentes
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  refetchUser: () => void; // A função que força a atualização
}

// Cria o contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Componente Provedor que vai "envolver" a aplicação
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // A função que busca os dados do usuário na nossa API
  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (!response.ok) {
        throw new Error('Não autenticado');
      }
      const userData: User = await response.json();
      setUser(userData);
    } catch (error) {
      setUser(null); // Em caso de erro, o usuário é nulo
    } finally {
      setIsLoading(false);
    }
  };

  // Executa a busca de usuário uma vez quando o provedor é montado
  useEffect(() => {
    fetchUser();
  }, []);

  // O valor que será compartilhado com todos os componentes filhos
  const value = { user, isLoading, refetchUser: fetchUser };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// O hook customizado que os componentes usarão para acessar os dados
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};