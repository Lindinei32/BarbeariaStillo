// app/_actions/get-bookings.ts

"use server";

// Import da nossa conexão direta com o banco
import db from "@/app/_lib/db"; 

// As funções 'startOfDay' e 'endOfDay' continuam sendo úteis
import { startOfDay, endOfDay } from 'date-fns';

// A interface das props que a função recebe
interface GetBookingsProps {
  barbershopId: string; // É uma boa prática filtrar pela barbearia também
  date: Date;
}

// A interface que descreve o formato do retorno
interface Booking {
  date: Date;
}

// A função agora retorna uma Promise de um array do nosso tipo Booking
export const getbookings = async ({ barbershopId, date }: GetBookingsProps): Promise<Booking[]> => {
  // Se a data não for fornecida, retorna uma lista vazia para evitar erros
  if (!date || !barbershopId) {
    return [];
  }

  try {
    // ===================================================================
    // AÇÃO 1: CALCULAR O INÍCIO E O FIM DO DIA
    // ===================================================================
    // Esta lógica continua a mesma, pois é independente do banco de dados.
    const startDate = startOfDay(date);
    const endDate = endOfDay(date);
    
    // ===================================================================
    // AÇÃO 2: SUBSTITUIR A QUERY DO PRISMA POR UMA QUERY SQL DIRETA
    // ===================================================================
    const query = `
      SELECT b.date
      FROM "Booking" as b
      -- Fazemos um JOIN para conseguir filtrar pelo ID da barbearia
      INNER JOIN "BarbershopService" as s ON b."serviceId" = s.id
      WHERE
        s."barbershopId" = $1 AND -- Filtra pela barbearia
        b.date >= $2 AND -- Filtra pela data/hora de início do dia
        b.date <= $3;  -- Filtra pela data/hora de fim do dia
    `;

    // Passamos os parâmetros de forma segura para a query
    const result = await db.query(query, [barbershopId, startDate, endDate]);
    
    // O resultado da query já está no formato que precisamos: um array de objetos { date: Date }
    // A biblioteca 'pg' já converte os tipos TIMESTAMP do PostgreSQL para objetos Date do JavaScript.
    return result.rows;

  } catch (error) {
    console.error("Erro ao buscar agendamentos do dia:", error);
    // Em caso de erro, retornamos uma lista vazia para não quebrar o cliente.
    return [];
  }
};