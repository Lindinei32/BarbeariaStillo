// app/_components/ui/register-form.tsx

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "./button";
import { Input } from "./input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card";

const RegisterForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Falha ao tentar cadastrar.');
      }

      toast.success('Cadastro realizado com sucesso! Faça seu login.');
      router.push('/'); 

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
        <CardTitle className="text-2xl font-bold">Criar Conta</CardTitle>
        <CardDescription className="text-gray-200 font-semibold">
          Preencha os campos para se cadastrar.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1 font-bold">
            <label htmlFor="name">Nome de Usuário</label>
            <Input 
              id="name" 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
              className="border-[#daa520] bg-zinc-900 text-whte placeholder:text-gray-400"
            />
          </div>

          <div className="space-y-1 font-bold">
            <label htmlFor="phone">Telefone</label>
            {/* =================================================================== */}
            {/* A CLASSE FOI ADICIONADA ÀS EXISTENTES                           */}
            {/* =================================================================== */}
            <Input 
              id="phone" 
              type="tel" 
              placeholder="(XX) XXXXX-XXXX" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
              required 
              className="border-[#daa520] bg-zinc-900 text-white placeholder:text-gray-400"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="email">E-mail (Opcional)</label>
            <Input 
              id="email" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className="border-[#daa520] bg-zinc-900 text-white placeholder:text-gray-400"
            />
          </div>

          <div className="space-y-1 font-bold">
            <label htmlFor="password">Senha</label>
            {/* =================================================================== */}
            {/* E AQUI TAMBÉM                                                  */}
            {/* =================================================================== */}
            <Input 
              id="password" 
              type="password" 
              placeholder="Mínimo de 4 caracteres" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              className="border-[#daa520] bg-zinc-900 text-white placeholder:text-gray-400 font-bold"
            />
          </div>
          
          <Button type="submit" className="w-full bg-[#9c6a1c] hover:bg-[#b5812e] h-11 text-base font-bold" disabled={isLoading}>
            {isLoading ? "Salvando..." : "Salvar Cadastro"}
          </Button>

          {error && (
            <p className="text-sm text-red-500 text-center pt-2">
              {error}
            </p>
          )}
        </form>
      </CardContent>
      <CardFooter className="flex justify-center pt-4">
        <p className="text-sm text-white font-bold">
            Já tem uma conta?{" "}
          <Link href="/" className="font-semibold text-[#FFD700] hover:underline">
            Faça o login
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
};

export default RegisterForm;