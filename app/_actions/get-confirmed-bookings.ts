// app/_actions/get-confirmed-bookings.ts

"use server";

import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import db from "@/app/_lib/db";

// Esta é a "planta" dos dados que o componente ClientBookingList espera receber
export interface ConfirmedBookingClientSafe {
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

// A função que busca os agendamentos futuros do usuário logado
export const getConfirmedBookings = async (): Promise<ConfirmedBookingClientSafe[]> => {
  try {
    // 1. Pega o token para identificar o usuário
    const token = cookies().get("auth_token")?.value;
    if (!token) {
      return []; // Se não há token, não há usuário logado, retorna lista vazia
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const userId = decoded.userId;

    if (!userId) {
      return [];
    }

    // 2. Busca no banco os agendamentos do usuário que ainda não aconteceram
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
        b."userId" = $1 AND b.date >= NOW()
      ORDER BY
        b.date ASC;
    `;
    
    const result = await db.query(query, [userId]);

    // 3. Mapeia os dados para o formato que o frontend precisa
    const clientReadyBookings: ConfirmedBookingClientSafe[] = result.rows.map((row) => ({
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
    console.error("[getConfirmedBookings] Erro ao buscar próximos agendamentos:", error);
    return []; // Retorna uma lista vazia em caso de erro
  }
};