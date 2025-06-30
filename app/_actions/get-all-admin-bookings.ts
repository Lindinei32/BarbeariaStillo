"use server" // Marca como Server Action

import { db } from "../_lib/prisma" // Ajuste o caminho se necessário
import { Prisma } from "@prisma/client"
import { authOptions } from "../_lib/auth" // Para verificar permissão
import { getServerSession } from "next-auth"

// ========================================================================
// CORREÇÃO: O TIPO PRECISA REFLETIR 'include: { user: true }' AGORA
// ========================================================================
export type BookingAdminListData = Prisma.BookingGetPayload<{
  include: {
    user: true // Busca todos os campos escalares do usuário
    service: {
      // Mantém o select aqui se for suficiente (provavelmente é)
      select: {
        id: true
        name: true
        barbershop: {
          select: {
            id: true
            name: true
          }
        }
      }
    }
  }
}>
// ========================================================================

export const getAllAdminBookings = async (): Promise<
  BookingAdminListData[]
> => {
  // Opcional: Revalidar a sessão aqui se quiser uma segurança extra
  const session = await getServerSession(authOptions)
  if (!session?.user || !session.user.isAdmin) {
    console.error("Tentativa de acesso não autorizado a getAllAdminBookings")
    return []
  }

  try {
    const bookings = await db.booking.findMany({
      orderBy: {
        date: "desc", // Mantenha a ordenação desejada
      },
      // ========================================================================
      // CORREÇÃO: A CONSULTA PRECISA USAR 'include: { user: true }'
      // ========================================================================
      include: {
        user: true, // Busca todos os campos do usuário
        service: {
          // Mantém o select aqui
          select: {
            id: true,
            name: true,
            barbershop: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      // ========================================================================
    })

    // IMPORTANTE: Serializar antes de retornar para o Client Component
    return JSON.parse(JSON.stringify(bookings))
  } catch (error) {
    console.error("Erro ao buscar todas as reservas (Admin Action):", error)
    // Lança erro para o cliente tratar
    throw new Error("Não foi possível buscar as reservas.")
  }
}
