// app/_actions/clear-barbershop-hours.ts

"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

// Importa a conexão 'db' da forma correta
import db from "@/app/_lib/db";

export const clearBarbershopHours = async (barbershopId: string) => {
  // Se o ID da barbearia não for fornecido, retorna um erro.
  if (!barbershopId) {
    throw new Error("ID da barbearia é obrigatório.");
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
    
    // Se o token não indicar que o usuário é admin, bloqueia a ação.
    if (!decoded.isAdmin) {
      throw new Error("Acesso negado: Apenas administradores podem executar esta ação.");
    }

    // ===================================================================
    // AÇÃO 2: SUBSTITUIR A QUERY DO PRISMA POR SQL DIRETO
    // ===================================================================
    console.log(`[Admin Action] Limpando horários para a barbearia: ${barbershopId}`);

    // Query SQL para setar os horários como NULL
    const updateQuery = `
      UPDATE "Barbershop"
      SET "openingTime" = NULL, "closingTime" = NULL
      WHERE id = $1;
    `;

    await db.query(updateQuery, [barbershopId]);

    console.log(`Horários da barbearia ${barbershopId} limpos com sucesso.`);

    // ===================================================================
    // AÇÃO 3: REVALIDAR O CACHE PARA ATUALIZAR A UI
    // ===================================================================
    revalidatePath("/"); // Revalida a home, onde o horário pode ser exibido
    revalidatePath("/adm"); // Revalida a página de administração

  } catch (error) {
    console.error("Erro ao limpar horários da barbearia:", error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Ocorreu um erro inesperado ao limpar os horários.");
  }
};