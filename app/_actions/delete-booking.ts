"use server"

import { revalidatePath } from "next/cache"
import { db } from "../_lib/prisma"
// 1. Importar tipos de erro do Prisma
import { Prisma } from "@prisma/client"

import { Booking } from "@prisma/client";

export const deleteBooking = async (bookingId: string): Promise<Booking | null> => { // 2. Tipar o retorno (opcional mas bom)
  // Validação básica de entrada
  if (!bookingId) {
    console.error("[Action deleteBooking] ERRO: bookingId não fornecido.");
    // Lança um erro que pode ser capturado pela UI
    throw new Error("ID do agendamento é necessário.");
  }
  console.log(`[Action deleteBooking] Iniciando exclusão para ID: ${bookingId}`);

  try {
    // Tentar DELETAR o agendamento
    const deletedBooking = await db.booking.delete({
      where: { id: bookingId },
    });

    console.log(`[Action deleteBooking] Sucesso! Agendamento ${bookingId} excluído.`);

    // --- REVALIDAÇÃO por PATH (Essencial) ---
    // Limpa o cache das páginas para que elas busquem dados atualizados
    revalidatePath("/adm");
    console.log("[Action deleteBooking] Cache PATH revalidado: /adm");
    revalidatePath("/bookings"); // Página de agendamentos do usuário
    console.log("[Action deleteBooking] Cache PATH revalidado: /bookings");

    return deletedBooking; // Retorna o agendamento deletado

  // 3. Capturar erro como 'unknown'
  } catch (error: unknown) {
    // 4. Verificar se é um erro conhecido do Prisma (PrismaClientKnownRequestError)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Verificar especificamente pelo código P2025 (Registro não encontrado para deletar)
      if (error.code === 'P2025') {
        console.warn(`[Action deleteBooking] Agendamento ${bookingId} não encontrado para exclusão (código P2025). Pode já ter sido excluído.`);
        // Revalidar os paths mesmo assim pode ajudar em casos de cache inconsistente
        revalidatePath("/adm");
        revalidatePath("/bookings");
        // Retorna null para indicar que a operação "falhou" porque o registro não existia
        return null;
      }
      // Poderia tratar outros códigos de erro do Prisma aqui se necessário
    }

    // 5. Tratamento para outros tipos de erros (genéricos, rede, etc.)
    console.error(`[Action deleteBooking] ERRO GERAL ao excluir agendamento ${bookingId}:`, error);

    // Monta uma mensagem de erro mais útil, se possível
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido durante a exclusão.";
    // Lança um novo erro para ser capturado pela UI, evitando expor detalhes internos
    throw new Error(`Falha ao excluir agendamento: ${errorMessage}`);
  }
};