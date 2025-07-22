// app/api/auth/register/route.ts

import { NextResponse } from 'next/server';
import db from '@/app/_lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { name, email, password, phone } = await req.json();

    // --- NOVA LÓGICA DE VALIDAÇÃO ---
    // Agora, nome, senha e telefone são obrigatórios.
    if (!name || !password || !phone) {
      return NextResponse.json({ message: 'Nome de usuário, senha e telefone são obrigatórios.' }, { status: 400 });
    }
    
    if (password.length < 4) {
      return NextResponse.json({ message: 'A senha precisa ter no mínimo 4 caracteres.' }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Se o email não for fornecido (string vazia), nós o salvamos como NULL.
    const emailToSave = email || null;
    
    // A coluna "phone" foi adicionada ao INSERT
    const query = `
      INSERT INTO "User" (name, email, password_hash, phone, "isAdmin", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, FALSE, NOW(), NOW())
    `;

    // Passamos a variável 'phone' e 'emailToSave' como parâmetros
    await db.query(query, [name, emailToSave, password_hash, phone]);

    return NextResponse.json({ message: 'Usuário cadastrado com sucesso!' }, { status: 201 });

  } catch (error: any) {
    if (error.code === '23505') {
      if (error.constraint === 'user_name_unique') {
        return NextResponse.json({ message: 'Este nome de usuário já está em uso.' }, { status: 409 });
      }
      // Esta verificação ainda é útil para o caso de o usuário fornecer um e-mail que já existe
      if (error.constraint === 'User_email_key') {
        return NextResponse.json({ message: 'Este e-mail já está cadastrado.' }, { status: 409 });
      }
    }
    
    console.error('Erro na API de registro:', error);
    return NextResponse.json({ message: 'Erro interno do servidor ao registrar.' }, { status: 500 });
  }
}