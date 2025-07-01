// app/_actions/update-barbershop-hours.ts

"use server";

import { revalidatePath } from "next/cache";
import { db } from "../_lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../_lib/auth";

export const updateBarbershopHours = async (formData: FormData) => {
  const session = await getServerSession(authOptions);

  // Bloco de segurança para garantir que apenas um admin logado pode executar esta ação
  if (!session?.user || !(session.user as any).isAdmin) {
    return { error: "Acesso negado. Apenas administradores podem alterar horários." };
  }

  try {
    // Atualiza o banco de dados com os dados do formulário
    await db.barbershop.update({
      where: { id: formData.get("barbershopId") as string },
      data: {
        openingTime: formData.get("openingTime") as string,
        closingTime: formData.get("closingTime") as string,
      },
    });

    // Invalida o cache da página Home para que ela mostre os novos horários
    revalidatePath("/");

    return { success: true };

  } catch (error) {
    console.error("Erro ao atualizar horários:", error);
    return { error: "Ocorreu um erro ao salvar os horários." };
  }
};