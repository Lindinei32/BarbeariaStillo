// app/_actions/get-all-admin-bookings.ts

'use server'

import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import db from '@/app/_lib/db'

// A "planta" dos dados que esta action irá retornar
export interface BookingAdminListData {
  id: string
  date: Date
  user: {
    name: string | null
    image: string | null
    phone: string | null
  } | null
  service: {
    name: string
  } | null
}

export const getAllAdminBookings = async (): Promise<BookingAdminListData[]> => {
  try {
    // Lógica para verificar se o usuário é um administrador
    const token = cookies().get('auth_token')?.value
    if (!token) {
      throw new Error('Não autorizado: Faça o login como administrador.')
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { isAdmin: boolean }

    if (!decoded.isAdmin) {
      throw new Error('Acesso negado: Rota exclusiva para administradores.')
    }

    console.log('[Admin Action] Buscando todos os agendamentos...')

    // A Query SQL com JOINs. A causa do erro está aqui se os tipos
    // das colunas sendo comparadas (ex: b."userId" e u.id) não forem iguais no banco.
    const query = `
      SELECT
        b.id,
        b.date,
        u.name as "userName",
        u.image as "userImage",
        u.phone as "userPhone",
        s.name as "serviceName"
      FROM 
        "Booking" as b
      LEFT JOIN
        "User" as u ON b."userId" = u.id
      LEFT JOIN
        "BarbershopService" as s ON b."serviceId" = s.id
      ORDER BY
        b.date ASC;
    `

    const result = await db.query(query)

    // Mapeamento dos dados para o formato que o frontend espera
    const bookings: BookingAdminListData[] = result.rows.map((row) => ({
      id: row.id,
      date: new Date(row.date),
      user: row.userName ? {
        name: row.userName,
        image: row.userImage,
        phone: row.userPhone,
      } : null,
      service: row.serviceName ? {
        name: row.serviceName,
      } : null,
    }))

    return bookings
  } catch (error) {
    console.error('Erro ao buscar todos os agendamentos de admin:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Ocorreu um erro inesperado ao buscar os agendamentos.')
  }
}