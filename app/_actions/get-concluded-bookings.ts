// app/_actions/get-concluded-bookings.ts

'use server'

import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import db from '@/app/_lib/db'
// Importamos o mesmo tipo da outra action para manter a consistência
import { ConfirmedBookingClientSafe } from './get-confirmed-bookings'

// A função agora retorna uma Promise do mesmo tipo, pois a estrutura dos dados é a mesma
export const getConcludedBookings = async (): Promise<
  ConfirmedBookingClientSafe[]
> => {
  try {
    const token = cookies().get('auth_token')?.value
    if (!token) {
      return []
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string
    }
    const userId = decoded.userId

    if (!userId) {
      return []
    }

    // A única diferença lógica está no WHERE: buscamos datas passadas (lt: less than)
    const query = `
      SELECT
        b.id, b.date,
        s.id as "serviceId", s.name as "serviceName", s.price,
        bb.id as "barbershopId", bb.name as "barbershopName", bb.address, bb."imageUrl", bb.phones
      FROM "Booking" as b
      LEFT JOIN "BarbershopService" as s ON b."serviceId" = s.id
      LEFT JOIN "Barbershop" as bb ON s."barbershopId" = bb.id
      WHERE b."userId" = $1 AND b.date < NOW() -- Busca agendamentos passados
      ORDER BY b.date DESC; -- Ordena do mais recente para o mais antigo
    `

    const result = await db.query(query, [userId])

    const clientReadyBookings: ConfirmedBookingClientSafe[] = result.rows.map(
      (row) => ({
        id: row.id,
        date: new Date(row.date),
        service: {
          id: row.serviceId,
          name: row.serviceName,
          price: String(row.price),
          barbershop: {
            id: row.barbershopId,
            name: row.barbershopName,
            address: row.address,
            imageUrl: row.imageUrl,
            phones: row.phones,
          },
        },
      }),
    )

    return clientReadyBookings
  } catch (error) {
    console.error(
      '[getConcludedBookings] Erro ao buscar histórico de agendamentos:',
      error,
    )
    return []
  }
}
