"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "../_lib/auth"
import { db } from "../_lib/prisma"
import { Prisma } from "@prisma/client"

export type ConcludedBookingClientSafe = Prisma.BookingGetPayload<{
  include: {
    service: {
      include: {
        barbershop: true
      }
    }
  }
}>;

export const getConcludeBookings = async (): Promise<ConcludedBookingClientSafe[]> => {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    console.warn("[getConcludeBookings] Tentativa de acesso sem sessão ou ID de usuário.");
    return [];
  }

  const userId = session.user.id;

  try {
    console.log(`[getConcludeBookings] Buscando agendamentos concluídos para userId: ${userId}`);
    const bookingsFromDb = await db.booking.findMany({
      where: {
        userId: userId,
        date: { lt: new Date() },
      },
      include: {
        service: { include: { barbershop: true } },
      },
      orderBy: {
        date: "desc",
      },
    });
    console.log(`[getConcludeBookings] Encontrados ${bookingsFromDb.length} agendamentos.`);

    const clientReadyBookings: ConcludedBookingClientSafe[] = JSON.parse(JSON.stringify(bookingsFromDb));

    return clientReadyBookings;
  } catch (_error) {
    console.error("[getConcludeBookings] Erro ao buscar histórico de agendamentos:", _error);
    throw new Error("Falha ao buscar histórico de agendamentos.");
  }
}