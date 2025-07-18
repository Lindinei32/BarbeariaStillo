"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

// Importa a conexão 'db' da forma correta
import db from "@/app/_lib/db";

// A função agora recebe um objeto com os dados, em vez de um FormData bruto,
// o que torna a validação mais fácil e clara.
interface UpdateHoursParams {
  barbershopId: string;
  openingTime: string;
  closingTime: string;
}

export const updateBarbershopHours = async (params: UpdateHoursParams) => {
  const { barbershopId, openingTime, closingTime } = params;

  // Validação básica dos parâmetros
  if (!barbershopId || !openingTime || !closingTime) {
    throw new Error("Todos os campos são obrigatórios: ID da barbearia, horário de abertura e fechamento.");
  }
  
  try {
    // ===================================================================
    // AÇÃO 1: VERIFICAR SE O USUÁRIO É UM ADMINISTRADOR
    // ===================================================================
    const token = cookies().get("auth_token")?.value;
    if (!token) {
      throw new Error("Não autorizado: Faça o login como administrador.");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { isAdmin: boolean };
    
    if (!decoded.isAdmin) {
      throw new Error("Acesso negado: Apenas administradores podem executar esta ação.");
    }

    // ===================================================================
    // AÇÃO 2: SUBSTITUIR A QUERY DO PRISMA POR SQL DIRETO
    // ===================================================================
    console.log(`[Admin Action] Atualizando horários para a barbearia: ${barbershopId}`);

    // Query SQL para atualizar os horários
    const updateQuery = `
      UPDATE "Barbershop"
      SET "openingTime" = $1, "closingTime" = $2
      WHERE id = $3;
    `;

    await db.query(updateQuery, [openingTime, closingTime, barbershopId]);

    console.log(`Horários da barbearia ${barbershopId} atualizados com sucesso.`);

    // ===================================================================
    // AÇÃO 3: REVALIDAR O CACHE
    // ===================================================================
    revalidatePath("/");
    revalidatePath("/adm");

  } catch (error) {
    console.error("Erro ao atualizar horários da barbearia:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Ocorreu um erro inesperado ao atualizar os horários.");
  }
};
