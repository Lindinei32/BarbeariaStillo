// app/_components/ui/sign-in-dialog.tsx

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { DialogTitle, DialogDescription, DialogHeader } from "./dialog";
import { Button } from "./button";
import { Input } from "./input";
import { useAuth } from "@/app/_context/AuthContext"; // <-- 1. IMPORTE O HOOK DO LUGAR CERTO

interface SignInDialogProps {
  onLoginSuccess?: () => void;
}

const SignInDialog = ({ onLoginSuccess }: SignInDialogProps) => {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 2. Pegamos a função 'refetchUser' do nosso contexto
  const { refetchUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Falha ao tentar fazer login.');
      }

      toast.success('Login realizado com sucesso!');
      
      // 3. Chamamos a função para forçar a atualização do estado global
      refetchUser();

      // Fecha o modal
      if (onLoginSuccess) {
        onLoginSuccess();
      }

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        toast.error(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center justify-center rounded-lg border-2 border-[#FFD700] bg-[#121212] p-5 text-white">
      <DialogHeader className="w-full text-center">
        <DialogTitle>Faça seu Login</DialogTitle>
        <DialogDescription>
          Acesse sua conta com nome de usuário e senha.
        </DialogDescription>
      </DialogHeader>

      <div className="mt-5 w-full space-y-4">
        <Input
          type="text"
          placeholder="Nome de Usuário"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoComplete="username"
          className="border-[#daa520] bg-zinc-900 text-white placeholder:text-gray-400"
        />
        <Input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          className="border-[#daa520] bg-zinc-900 text-white placeholder:text-gray-400"
        />
      </div>

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

      <Button
        type="submit"
        className="mt-5 w-full border-2 border-[#221d3d] bg-[#9c6a1c] hover:bg-[#b5812e]"
        disabled={isLoading}
      >
        {isLoading ? "Entrando..." : "Entrar"}
      </Button>

      <div className="mt-4 flex w-full justify-between text-xs">
        <Link href="/register" className="text-gray-400 hover:underline">
          Faça seu Cadastro
        </Link>
        <Link href="/forgot-password" className="text-gray-400 hover:underline">
          Esqueci minha Senha
        </Link>
      </div>
    </form>
  );
};

export default SignInDialog;