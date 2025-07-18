// app/_data/get-conclud-bookings.ts

"use server";

// NOVOS IMPORTS
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import db from "@/app/_lib/db"; // <-- Sua nova conexão direta com o banco ('pg')

// ===================================================================
// AÇÃO 1: DEFINIR MANUALMENTE O TIPO DE RETORNO (O "CONTRATO")
// ===================================================================
// Usamos a mesma estrutura de dados da outra action para manter a consistência.
export interface ConcludedBookingClientSafe {
  id: string;
  date: Date;
  service: {
    id: string;
    name: string;
    price: string;
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
export const getConcludeBookings = async (): Promise<ConcludedBookingClientSafe[]> => {
  try {
    // ===================================================================
    // AÇÃO 2: SUBSTITUIR A LÓGICA DE SESSÃO PELA VERIFICAÇÃO DO TOKEN JWT
    // ===================================================================
    const token = cookies().get("auth_token")?.value;

    if (!token) {
      console.warn('[getConcludeBookings] Tentativa de acesso sem token.');
      return [];
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const userId = decoded.userId;

    if (!userId) {
      console.warn('[getConcludeBookings] Token inválido ou sem userId.');
      return [];
    }

    // ===================================================================
    // AÇÃO 3: SUBSTITUIR A QUERY DO PRISMA POR UMA QUERY SQL DIRETA
    // ===================================================================
    console.log(`[getConcludeBookings] Buscando agendamentos concluídos para userId: ${userId}`);

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
        b."userId" = $1 AND b.date < NOW() -- A ÚNICA DIFERENÇA LÓGICA: BUSCA DATAS PASSADAS
      ORDER BY
        b.date DESC; -- Ordena do mais recente para o mais antigo
    `;
    
    const result = await db.query(query, [userId]);

    console.log(`[getConcludeBookings] Encontrados ${result.rows.length} agendamentos.`);

    // ===================================================================
    // AÇÃO 4: MAPEAMOS O RESULTADO PARA O FORMATO QUE O CLIENTE ESPERA
    // ===================================================================
    const clientReadyBookings: ConcludedBookingClientSafe[] = result.rows.map((row) => ({
      id: row.id,
      date: new Date(row.date),
      service: {
        id: row.serviceId,
        name: row.serviceName,
        price: String(row.price),
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
    console.error("[getConcludeBookings] Erro ao buscar histórico de agendamentos:", error);
    // Em um cenário de produção, poderíamos logar o erro em um serviço de monitoramento.
    // Para o cliente, retornamos uma lista vazia para evitar que a aplicação quebre.
    return [];
  }
};