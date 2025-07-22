// app/api/auth/reset-password/route.ts

import { NextResponse } from 'next/server';
import db from '@/app/_lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { name, newPassword } = await req.json();

    if (!name || !newPassword) {
      return NextResponse.json({ message: 'Nome de usuário e nova senha são obrigatórios.' }, { status: 400 });
    }
    if (newPassword.length < 4) {
      return NextResponse.json({ message: 'A nova senha precisa ter no mínimo 4 caracteres.' }, { status: 400 });
    }

    // Primeiro, verifica se o usuário realmente existe
    const userCheckQuery = 'SELECT id FROM "User" WHERE LOWER(name) = LOWER($1)';
    const userCheckResult = await db.query(userCheckQuery, [name]);
    
    if (userCheckResult.rows.length === 0) {
      return NextResponse.json({ message: 'Usuário não encontrado.' }, { status: 404 });
    }

    // Criptografa a nova senha
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(newPassword, salt);

    // Executa o UPDATE no banco de dados
    const updateQuery = `
      UPDATE "User"
      SET password_hash = $1, "updatedAt" = NOW()
      WHERE LOWER(name) = LOWER($2);
    `;

    await db.query(updateQuery, [password_hash, name]);

    return NextResponse.json({ message: 'Senha redefinida com sucesso!' }, { status: 200 });

  } catch (error) {
    console.error('Erro na API de redefinição de senha:', error);
    return NextResponse.json({ message: 'Erro interno do servidor.' }, { status: 500 });
  }
}