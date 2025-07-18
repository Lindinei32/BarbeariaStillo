// app/_actions/get-barbershop-data.ts

"use server";

// ===================================================================
// A CORREÇÃO PRINCIPAL ESTÁ AQUI: O IMPORT CORRETO
// ===================================================================
import db from "@/app/_lib/db"; // Importa 'db' usando a sintaxe de 'export default'

// Esta action busca os dados da barbearia para o painel de admin.
// Não precisa de autenticação, pois os dados da barbearia são públicos.
export const getBarbershopData = async () => {
  try {
    // ===================================================================
    // SUBSTITUÍMOS A CHAMADA DO PRISMA POR UMA QUERY SQL DIRETA
    // ===================================================================
    // Busca a primeira barbearia encontrada, ordenando pela data de criação.
    const query = 'SELECT * FROM "Barbershop" ORDER BY "createdAt" ASC LIMIT 1';
    
    const result = await db.query(query);

    // Retorna o primeiro (e único) resultado da busca.
    const barbershop = result.rows[0];

    return barbershop;

  } catch (error) {
    console.error("Erro ao buscar dados da barbearia:", error);
    // Lançamos um erro para que o componente que chamou saiba que algo deu errado.
    throw new Error("Não foi possível carregar os dados da barbearia.");
  }
};