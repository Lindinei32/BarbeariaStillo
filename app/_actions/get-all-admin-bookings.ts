// app/_actions/get-all-admin-bookings.ts

'use server'

// Imports necessários para a nova arquitetura
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import db from '@/app/_lib/db' // Nossa conexão direta com o banco

// Definimos a "forma" dos dados que esta action irá retornar
export interface BookingAdminListData {
  id: string
  date: Date
  user: {
    name: string | null
    image: string | null
  } | null
  service: {
    name: string
  } | null
}

export const getAllAdminBookings = async (): Promise<
  BookingAdminListData[]
> => {
  try {
    // ===================================================================
    // AÇÃO 1: VERIFICAR SE O USUÁRIO É UM ADMINISTRADOR
    // ===================================================================
    const token = cookies().get('auth_token')?.value
    if (!token) {
      throw new Error('Não autorizado: Faça o login como administrador.')
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      isAdmin: boolean
    }

    // Se o token não indicar que o usuário é admin, bloqueia a ação.
    if (!decoded.isAdmin) {
      throw new Error('Acesso negado: Rota exclusiva para administradores.')
    }

    // ===================================================================
    // AÇÃO 2: SUBSTITUIR A QUERY DO PRISMA POR SQL DIRETO COM JOINs
    // ===================================================================
    console.log('[Admin Action] Buscando todos os agendamentos...')

    const query = `
      SELECT
        b.id,
        b.date,
        u.name as "userName",
        u.image as "userImage",
        s.name as "serviceName"
      FROM 
        "Booking" as b
      LEFT JOIN
        "User" as u ON b."userId" = u.id
      LEFT JOIN
        "BarbershopService" as s ON b."serviceId" = s.id
      ORDER BY
        b.date DESC; -- Ordena do mais recente para o mais antigo
    `

    const result = await db.query(query)

    // ===================================================================
    // AÇÃO 3: MAPEAMOS O RESULTADO PARA O FORMATO QUE O CLIENTE ESPERA
    // ===================================================================
    const bookings: BookingAdminListData[] = result.rows.map((row) => ({
      id: row.id,
      date: new Date(row.date),
      user: {
        name: row.userName,
        image: row.userImage,
      },
      service: {
        name: row.serviceName,
      },
    }))

    return bookings
  } catch (error) {
    console.error('Erro ao buscar todos os agendamentos de admin:', error)
    if (error instanceof Error) {
      // Repassa a mensagem de erro específica (ex: "Acesso negado") para o cliente
      throw error
    }
    throw new Error('Ocorreu um erro inesperado ao buscar os agendamentos.')
  }
}
