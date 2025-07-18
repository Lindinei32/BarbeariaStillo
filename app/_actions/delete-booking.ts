// app/_actions/delete-booking.ts

"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

// ===================================================================
// A CORREÇÃO PRINCIPAL ESTÁ AQUI
// ===================================================================
// Importamos o 'db' usando a sintaxe de 'export default', sem chaves.
import db from "@/app/_lib/db"; 

export const deleteBooking = async (bookingId: string) => {
  // Se o bookingId não for fornecido, lançamos um erro.
  if (!bookingId) {
    throw new Error("ID do agendamento é obrigatório.");
  }

  try {
    // ===================================================================
    // LÓGICA DE AUTENTICAÇÃO E AUTORIZAÇÃO
    // ===================================================================
    const token = cookies().get("auth_token")?.value;
    if (!token) {
      throw new Error("Não autorizado.");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string, isAdmin: boolean };
    const userId = decoded.userId;
    const isAdmin = decoded.isAdmin;

    // ===================================================================
    // LÓGICA DE DELEÇÃO COM SQL DIRETO
    // ===================================================================
    let deleteQuery: string;
    let queryParams: string[];

    if (isAdmin) {
      // Se for admin, pode deletar qualquer agendamento apenas pelo ID do agendamento.
      console.log(`[Admin Delete] Usuário ${userId} (admin) está deletando o agendamento ${bookingId}.`);
      deleteQuery = 'DELETE FROM "Booking" WHERE id = $1';
      queryParams = [bookingId];
    } else {
      // Se não for admin, ele só pode deletar o agendamento se ele pertencer a ele.
      console.log(`[User Delete] Usuário ${userId} está tentando deletar o agendamento ${bookingId}.`);
      deleteQuery = 'DELETE FROM "Booking" WHERE id = $1 AND "userId" = $2';
      queryParams = [bookingId, userId];
    }

    const result = await db.query(deleteQuery, queryParams);

    // Verificamos se alguma linha foi de fato deletada.
    // Se result.rowCount for 0, significa que a condição WHERE não foi satisfeita
    // (ex: um usuário comum tentando deletar o agendamento de outra pessoa).
    if (result.rowCount === 0) {
      throw new Error("Você não tem permissão para cancelar esta reserva ou ela não existe.");
    }

    // ===================================================================
    // REVALIDAÇÃO DE CACHE (permanece igual)
    // ===================================================================
    revalidatePath("/");
    revalidatePath("/bookings"); // Supondo que você tenha essa página

  } catch (error) {
    console.error("Erro ao deletar agendamento:", error);
    // Lança o erro para ser capturado pelo 'catch' no componente cliente.
    if (error instanceof Error) {
        throw new Error(error.message);
    }
    throw new Error("Ocorreu um erro ao cancelar o agendamento.");
  }
};