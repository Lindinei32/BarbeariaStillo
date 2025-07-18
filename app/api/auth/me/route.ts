// app/api/auth/me/route.ts

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

// Esta é a função que será executada quando o hook `useAuth` fizer um fetch
export async function GET() {
  try {
    // 1. Pega o token do cookie que foi setado no login
    const token = cookies().get('auth_token')?.value;

    // 2. Se não houver token, o usuário não está logado. Retorna erro.
    if (!token) {
      return NextResponse.json({ error: 'Não autorizado: token não encontrado.' }, { status: 401 });
    }

    // 3. Verifica se o token é válido usando a mesma chave secreta do login
    const decodedPayload = jwt.verify(token, process.env.JWT_SECRET!);

    // 4. Se o token for válido, retorna os dados do usuário contidos nele
    return NextResponse.json(decodedPayload);

  } catch (error) {
    // Se jwt.verify falhar (token expirado, malformado, etc.), ele lança um erro.
    // Nós o capturamos e retornamos um erro de não autorizado.
    return NextResponse.json({ error: 'Token inválido.' }, { status: 401 });
  }
}