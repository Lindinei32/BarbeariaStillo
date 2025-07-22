// app/_actions/create-booking.tsx

'use server'

import db from '@/app/_lib/db'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

interface CreateBookingParams {
  serviceId: string
  barbershopId: string
  date: Date
  userId: string
}

interface NewBooking {
  id: string
}

export const createBooking = async (
  params: CreateBookingParams,
): Promise<NewBooking> => {
  // Verificação de autenticação e autorização
  const token = cookies().get('auth_token')?.value
  if (!token) {
    throw new Error('Você precisa estar logado para fazer um agendamento.')
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string
    }
    if (decoded.userId !== params.userId) {
      throw new Error('Conflito de autorização. Ação não permitida.')
    }
  } catch {
    throw new Error(
      'Sessão inválida ou expirada. Por favor, faça login novamente.',
    )
  }

  const { serviceId, barbershopId, date, userId } = params

  if (!serviceId || !barbershopId || !date || !userId) {
    throw new Error('Informações do agendamento incompletas.')
  }

  // Validação de horário já ocupado
  const checkExistingBookingQuery = `
    SELECT id FROM "Booking"
    WHERE "date" = $1 AND "serviceId" IN (
      SELECT id FROM "BarbershopService" WHERE "barbershopId" = $2
    )
    LIMIT 1;
  `
  const existingBookingResult = await db.query(checkExistingBookingQuery, [
    date,
    barbershopId,
  ])

  if (existingBookingResult.rows.length > 0) {
    throw new Error('Este horário já está reservado. Por favor, escolha outro.')
  }

  try {
    const insertQuery = `
      INSERT INTO "Booking" ("serviceId", "date", "userId", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, NOW(), NOW())
      RETURNING id;
    `

    const result = await db.query(insertQuery, [serviceId, date, userId])
    const newBooking = result.rows[0]

    if (!newBooking?.id) {
      throw new Error('Falha ao registrar o agendamento no banco de dados.')
    }

    console.log(
      `[Action createBooking] Reserva ${newBooking.id} criada com sucesso para User ID: ${userId}.`,
    )

    revalidatePath('/')
    revalidatePath('/bookings')

    return newBooking
  } catch (error) {
    console.error(
      `[Action createBooking] ERRO DETALHADO ao criar reserva para User ID ${userId}:`,
      error,
    )

    if (error instanceof Error) {
      throw new Error(error.message)
    }

    throw new Error(
      'Ocorreu um erro inesperado ao criar seu agendamento. Por favor, tente novamente.',
    )
  }
}
