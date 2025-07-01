// app/_actions/clear-barbershop-hours.ts

"use server";

import { revalidatePath } from "next/cache";
import { db } from "../_lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../_lib/auth";

export const clearBarbershopHours = async (barbershopId: string) => {
  const session = await getServerSession(authOptions);

  // Bloco de segurança para garantir que apenas um admin logado pode executar esta ação
  if (!session?.user || !(session.user as any).isAdmin) {
    return { error: "Acesso negado. Apenas administradores podem executar esta ação." };
  }

  // Validação simples para garantir que recebemos um ID
  if (!barbershopId) {
    return { error: "ID da barbearia não foi fornecido." };
  }

  try {
    // Atualiza o banco de dados, definindo os horários como nulos
    await db.barbershop.update({
      where: { id: barbershopId },
      data: {
        openingTime: null,
        closingTime: null,
      },
    });

    // Invalida o cache da página Home para que ela remova a mensagem de horário
    revalidatePath("/");

    return { success: true };

  } catch (error) {
    console.error("Erro ao limpar horários:", error);
    return { error: "Ocorreu um erro ao limpar os horários." };
  }
};