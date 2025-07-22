// app/_components/ui/forgot-password-form.tsx

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "./button";
import { Input } from "./input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card";

const ForgotPasswordForm = () => {
  const [name, setName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Falha ao redefinir a senha.');
      }

      toast.success('Senha redefinida com sucesso! Faça seu login com a nova senha.');
      router.push('/'); // Redireciona para a página de login

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
    <Card className="w-full max-w-md border-2 border-[#FFD700] bg-[#121212] p-2 text-white shadow-lg shadow-yellow-900/20">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Redefinir Senha</CardTitle>
        <CardDescription className="text-gray-400">
          Digite seu nome de usuário e sua nova senha.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="name">Nome de Usuário</label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="border-[#daa520] bg-zinc-900 text-white placeholder:text-gray-400"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="newPassword">Nova Senha</label>
            <Input
              id="newPassword"
              type="password"
              placeholder="Mínimo de 4 caracteres"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="border-[#daa520] bg-zinc-900 text-white placeholder:text-gray-400"
            />
          </div>
          
          {error && <p className="text-sm text-red-500 text-center pt-2">{error}</p>}

          <Button type="submit" className="w-full bg-[#9c6a1c] hover:bg-[#b5812e] h-11 text-base font-bold" disabled={isLoading}>
            {isLoading ? "Salvando..." : "Salvar Nova Senha"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-gray-400">
          Lembrou a senha?{" "}
          <Link href="/" className="font-semibold text-[#FFD700] hover:underline">
            Faça o login
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
};

export default ForgotPasswordForm;