// app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import db from '@/app/_lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(req: Request) {
  try {
    const { name, password } = await req.json(); // Deve usar 'name' aqui

    if (!name || !password) {
      return NextResponse.json({ message: 'Nome de usuário e senha são obrigatórios.' }, { status: 400 });
    }

    // A query DEVE buscar por 'name'
    const query = 'SELECT * FROM "User" WHERE LOWER(name) = LOWER($1)';
    const userResult = await db.query(query, [name]);
    const user = userResult.rows[0];

    // ... (resto do arquivo como estava, com a verificação de senha e criação do token)
    
    if (!user) {
        return NextResponse.json({ message: 'Credenciais inválidas.' }, { status: 401 });
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordCorrect) {
        return NextResponse.json({ message: 'Credenciais inválidas.' }, { status: 401 });
    }

    const payload = { userId: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin };
    const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '1d' });
    const responseBody = { message: 'Login bem-sucedido!', user: payload };
    const response = NextResponse.json(responseBody, { status: 200 });
    response.cookies.set('auth_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24 });
    
    return response;

  } catch (error) {
    console.error('Erro no login:', error);
    return NextResponse.json({ message: 'Erro interno do servidor.' }, { status: 500 });
  }
}