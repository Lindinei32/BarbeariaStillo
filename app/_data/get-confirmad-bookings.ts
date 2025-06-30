"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "../_lib/auth"
import { db } from "../_lib/prisma"
import { Prisma } from "@prisma/client" // 1. Importar Prisma

// 2. Definir o tipo usando Prisma.BookingGetPayload com os includes corretos
export type ConfirmedBookingClientSafe = Prisma.BookingGetPayload<{
  include: {
    service: {
      include: {
        barbershop: true // Inclui a barbearia dentro do serviço
      }
    },
    // Novamente, 'user' não está no include da query original.
  }
}>;

// A função agora retorna uma Promise do tipo correto
export const getConfirmadBookings = async (): Promise<ConfirmedBookingClientSafe[]> => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    console.warn("[getConfirmadBookings] Tentativa de acesso sem sessão ou ID de usuário.");
    return []; // Retorna array vazio se não houver sessão/usuário
  }

  const userId = session.user.id;

  try {
    console.log(`[getConfirmadBookings] Buscando agendamentos confirmados para userId: ${userId}`);
    const bookingsFromDb = await db.booking.findMany({
      where: {
        userId: userId,
        date: { gte: new Date() }, // Busca agendamentos com data >= atual
      },
      include: {
        service: { include: { barbershop: true } }, // Mantém os includes da query
      },
      orderBy: {
        // Ordenar por data ASC faz mais sentido para próximos agendamentos
        date: "asc",
      },
    });
    console.log(`[getConfirmadBookings] Encontrados ${bookingsFromDb.length} agendamentos.`);

    // Serialização
    const clientReadyBookings: ConfirmedBookingClientSafe[] = JSON.parse(JSON.stringify(bookingsFromDb));

    return clientReadyBookings;

  // 3. Corrigir a variável 'error' não utilizada prefixando com _
  } catch (_error) {
    console.error("[getConfirmadBookings] Erro ao buscar próximos agendamentos:", _error);
    throw new Error("Falha ao buscar próximos agendamentos.");
  }
}