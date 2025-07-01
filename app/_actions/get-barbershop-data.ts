// app/_actions/get-barbershop-data.ts

"use server";

import { db } from "../_lib/prisma";

// Esta action busca os dados essenciais da barbearia para o formulário do admin.
// É segura para ser chamada do cliente, pois não requer autenticação para ver os dados.
export const getBarbershopData = async () => {
  try {
    // Busca a primeira barbearia que encontrar no banco.
    // Seleciona apenas os campos que o formulário precisa.
    const barbershop = await db.barbershop.findFirst({
      select: {
        id: true,
        openingTime: true,
        closingTime: true,
      },
    });

    return barbershop;

  } catch (error) {
    console.error("Erro ao buscar dados da barbearia para o admin:", error);
    // Retorna null se houver um erro, para que a página do admin saiba lidar com isso.
    return null;
  }
};