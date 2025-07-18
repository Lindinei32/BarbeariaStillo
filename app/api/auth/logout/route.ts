// app/api/auth/logout/route.ts

import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // 1. Prepara uma resposta de sucesso
    const response = NextResponse.json({ message: 'Logout bem-sucedido' });

    // 2. A "mágica" do logout: seta o mesmo cookie 'auth_token', mas com
    // um conteúdo vazio e uma data de expiração no passado (maxAge: -1).
    // O navegador vê isso e remove o cookie imediatamente.
    response.cookies.set('auth_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: -1, // Expira imediatamente
    });

    return response;

  } catch (error) {
    console.error('Erro na API de logout:', error);
    return NextResponse.json({ message: 'Erro interno do servidor.' }, { status: 500 });
  }
}