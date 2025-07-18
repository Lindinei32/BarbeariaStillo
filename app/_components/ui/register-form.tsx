// app/_components/ui/register-form.tsx

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

// Importando os componentes ShadCN que vamos usar
import { Button } from "./button";
import { Input } from "./input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card";

const RegisterForm = () => {
  // Estados para gerenciar os dados do formulário e a UI
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  // Função para lidar com a submissão do formulário
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null); // Limpa erros antigos

    try {
      // Faz a chamada para a nossa API de registro
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      // Se a API retornar um erro (ex: nome já cadastrado), nós o capturamos
      if (!response.ok) {
        throw new Error(data.message || 'Falha ao tentar cadastrar.');
      }

      // Se o cadastro for bem-sucedido:
      toast.success('Cadastro realizado com sucesso!');
      
      // Redireciona o usuário para a página inicial para que ele possa fazer o login
      router.push('/'); 

    } catch (err) {
      if (err instanceof Error) {
        // Exibe a mensagem de erro específica vinda da API
        setError(err.message);
        toast.error(err.message);
      }
    } finally {
      setIsLoading(false); // Reativa o botão
    }
  };

  return (
    // Usamos o Card como container principal para manter o estilo
    <Card className="w-full max-w-md border-2 border-[#FFD700] bg-[#121212] p-2 text-white shadow-lg shadow-yellow-900/20">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Criar Conta</CardTitle>
        <CardDescription className="text-gray-400">
          Junte-se a nós! Preencha os campos para se cadastrar.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Input para Nome de Usuário */}
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

          {/* Input para E-mail */}
          <div className="space-y-1">
            <label htmlFor="email">E-mail</label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border-[#daa520] bg-zinc-900 text-white placeholder:text-gray-400"
            />
          </div>

          {/* Input para Senha */}
          <div className="space-y-1">
            <label htmlFor="password">Senha</label>
            <Input
              id="password"
              type="password"
              placeholder="Mínimo de 4 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border-[#daa520] bg-zinc-900 text-white placeholder:text-gray-400"
            />
          </div>
          
          {/* Exibição de Erro */}
          {error && <p className="text-sm text-red-500 text-center pt-2">{error}</p>}

          <Button type="submit" className="w-full bg-[#9c6a1c] hover:bg-[#b5812e] h-11 text-base font-bold" disabled={isLoading}>
            {isLoading ? "Salvando..." : "Salvar Cadastro"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-gray-400">
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