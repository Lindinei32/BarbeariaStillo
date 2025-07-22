// app/api/auth/register/route.ts

import { NextResponse } from 'next/server'
import db from '@/app/_lib/db'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const { name, email, password, phone } = await req.json()

    if (!name || !password || !phone) {
      return NextResponse.json(
        { message: 'Nome de usuário, senha e telefone são obrigatórios.' },
        { status: 400 },
      )
    }
    if (password.length < 4) {
      return NextResponse.json(
        { message: 'A senha precisa ter no mínimo 4 caracteres.' },
        { status: 400 },
      )
    }

    const userCheckQuery = 'SELECT id FROM "User" WHERE LOWER(name) = LOWER($1)'
    const existingUser = await db.query(userCheckQuery, [name])
    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        {
          message:
            'Já existe um Cadastro com esse Nome. Sugestão: Cadastre um Apelido.',
        },
        { status: 409 },
      )
    }

    if (email) {
      const emailCheckQuery = 'SELECT id FROM "User" WHERE email = $1'
      const existingEmail = await db.query(emailCheckQuery, [email])
      if (existingEmail.rows.length > 0) {
        return NextResponse.json(
          { message: 'Este e-mail já está cadastrado.' },
          { status: 409 },
        )
      }
    }

    const salt = await bcrypt.genSalt(10)
    const password_hash = await bcrypt.hash(password, salt)
    const emailToSave = email || null

    const insertQuery = `
      INSERT INTO "User" (name, email, password_hash, phone, "isAdmin", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, FALSE, NOW(), NOW())
    `

    await db.query(insertQuery, [name, emailToSave, password_hash, phone])

    return NextResponse.json(
      { message: 'Usuário cadastrado com sucesso!' },
      { status: 201 },
    )
  } catch (error: unknown) {
    // <-- CORREÇÃO APLICADA AQUI
    // Verificação de tipo para acessar as propriedades do erro com segurança
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      'constraint' in error
    ) {
      const dbError = error as { code: string; constraint: string }
      if (dbError.code === '23505') {
        if (dbError.constraint === 'user_name_unique') {
          return NextResponse.json(
            { message: 'Este nome de usuário já está em uso.' },
            { status: 409 },
          )
        }
        if (dbError.constraint === 'User_email_key') {
          return NextResponse.json(
            { message: 'Este e-mail já está cadastrado.' },
            { status: 409 },
          )
        }
      }
    }

    console.error('Erro na API de registro:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor ao registrar.' },
      { status: 500 },
    )
  }
}
