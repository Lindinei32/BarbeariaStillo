// app/api/auth/register/route.ts

import { NextResponse } from 'next/server';

import bcrypt from 'bcryptjs';
import db from '@/app/_lib/db';

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Todos os campos são obrigatórios.' }, { status: 400 });
    }
    if (password.length < 4) {
      return NextResponse.json({ message: 'A senha precisa ter no mínimo 4 caracteres.' }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Verifique se os nomes das colunas aqui correspondem exatamente ao seu banco de dados
    const query = `
      INSERT INTO "User" (name, email, password_hash, "isAdmin", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, FALSE, NOW(), NOW());
    `;

    await db.query(query, [name, email, password_hash]);

    return NextResponse.json({ message: 'Usuário cadastrado com sucesso!' }, { status: 201 });

  } catch (error: any) {
    // Verifica se o erro é de nome de usuário duplicado
    if (error.code === '23505' && error.constraint === 'user_name_unique') {
      return NextResponse.json({ message: 'Este nome de usuário já está em uso.' }, { status: 409 });
    }

    // Para qualquer outro erro
    console.error('Erro na API de registro:', error);
    return NextResponse.json({ message: 'Erro interno do servidor ao registrar.' }, { status: 500 });
  }
}