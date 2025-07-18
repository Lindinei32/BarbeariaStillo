// app/_data/get-confirmad-bookings.ts

"use server";

// NOVOS IMPORTS
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import db from "@/app/_lib/db"; // <-- Sua nova conexão direta com o banco ('pg')

// ===================================================================
// AÇÃO 1: DEFINIR MANUALMENTE O TIPO DE RETORNO (O "CONTRATO")
// ===================================================================
// Este é o tipo que o nosso Client Component (ClientBookingList) espera receber.
// Ele descreve o formato exato dos dados que esta função promete retornar.
export interface ConfirmedBookingClientSafe {
  id: string;
  date: Date; // A data virá como string do banco, mas vamos convertê-la para Date
  service: {
    id: string;
    name: string;
    price: string; // Decimal do PG vem como string, o que é ótimo para o cliente
    barbershop: {
      id: string;
      name: string;
      address: string;
      imageUrl: string;
      phones: string;
    };
  };
}

// A função agora retorna uma Promise do nosso novo tipo
export const getConfirmadBookings = async (): Promise<ConfirmedBookingClientSafe[]> => {
  try {
    // ===================================================================
    // AÇÃO 2: SUBSTITUIR A LÓGICA DE SESSÃO PELA VERIFICAÇÃO DO TOKEN JWT
    // ===================================================================
    const token = cookies().get("auth_token")?.value;

    // Se não houver token, o usuário não está logado. Retornamos uma lista vazia.
    if (!token) {
      console.warn('[getConfirmadBookings] Tentativa de acesso sem token.');
      return []; 
    }

    // Verificamos o token para obter o ID do usuário
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const userId = decoded.userId;

    if (!userId) {
      console.warn('[getConfirmadBookings] Token inválido ou sem userId.');
      return [];
    }

    // ===================================================================
    // AÇÃO 3: SUBSTITUIR A QUERY DO PRISMA POR UMA QUERY SQL DIRETA
    // ===================================================================
    console.log(`[getConfirmadBookings] Buscando agendamentos confirmados para userId: ${userId}`);

    const query = `
      SELECT
        b.id,
        b.date,
        s.id as "serviceId",
        s.name as "serviceName",
        s.price,
        bb.id as "barbershopId",
        bb.name as "barbershopName",
        bb.address,
        bb."imageUrl",
        bb.phones
      FROM
        "Booking" as b
      LEFT JOIN
        "BarbershopService" as s ON b."serviceId" = s.id
      LEFT JOIN
        "Barbershop" as bb ON s."barbershopId" = bb.id
      WHERE
        b."userId" = $1 AND b.date >= NOW() -- Busca agendamentos com data >= atual
      ORDER BY
        b.date ASC; -- Ordena do mais próximo para o mais distante
    `;
    
    // Passamos o userId como um parâmetro seguro para evitar SQL Injection
    const result = await db.query(query, [userId]);

    console.log(`[getConfirmadBookings] Encontrados ${result.rows.length} agendamentos.`);

    // ===================================================================
    // AÇÃO 4: MAPEAMOS O RESULTADO PARA O FORMATO QUE O CLIENTE ESPERA
    // ===================================================================
    // O resultado do banco é "plano", precisamos aninhar os objetos.
    const clientReadyBookings: ConfirmedBookingClientSafe[] = result.rows.map((row) => ({
      id: row.id,
      date: new Date(row.date), // Converte a string de data do banco para um objeto Date
      service: {
        id: row.serviceId,
        name: row.serviceName,
        price: String(row.price), // Garante que o preço seja uma string
        barbershop: {
          id: row.barbershopId,
          name: row.barbershopName,
          address: row.address,
          imageUrl: row.imageUrl,
          phones: row.phones,
        },
      },
    }));

    return clientReadyBookings;

  } catch (error) {
    console.error("[getConfirmadBookings] Erro ao buscar próximos agendamentos:", error);
    // Se ocorrer qualquer erro (token expirado, erro de banco),
    // retornamos uma lista vazia para o cliente não quebrar.
    // Em um cenário real, poderíamos lançar um erro para ser tratado de forma diferente.
    return [];
  }
};
