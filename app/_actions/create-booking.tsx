// app/_actions/create-booking.ts

"use server";

import db from "@/app/_lib/db"; 
import { revalidatePath } from 'next/cache';
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

interface CreateBookingParams {
  serviceId: string;
  barbershopId: string;
  date: Date;
  userId: string;
}

interface NewBooking {
  id: string;
}

export const createBooking = async (params: CreateBookingParams): Promise<NewBooking> => {
  // ... (toda a sua lógica de autenticação e validação permanece a mesma)
  
  const { serviceId, barbershopId, date, userId } = params;

  if (!serviceId || !barbershopId || !date || !userId) {
    throw new Error("Informações do agendamento incompletas.");
  }
  
  const checkExistingBookingQuery = `
    SELECT id FROM "Booking"
    WHERE "date" = $1 AND "serviceId" IN (
      SELECT id FROM "BarbershopService" WHERE "barbershopId" = $2
    )
    LIMIT 1;
  `;
  const existingBookingResult = await db.query(checkExistingBookingQuery, [date, barbershopId]);

  if (existingBookingResult.rows.length > 0) {
    throw new Error("Este horário já está reservado. Por favor, escolha outro.");
  }

  try {
    // ===================================================================
    // A CORREÇÃO FINAL ESTÁ AQUI
    // ===================================================================
    // Adicionamos as colunas "createdAt" e "updatedAt" à lista de insert
    // e passamos a função NOW() do PostgreSQL para preenchê-las.
    const insertQuery = `
      INSERT INTO "Booking" ("serviceId", "date", "userId", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, NOW(), NOW())
      RETURNING id;
    `;
    
    // Não precisamos mudar os parâmetros, pois NOW() é executado pelo banco
    const result = await db.query(insertQuery, [serviceId, date, userId]);
    const newBooking = result.rows[0];

    if (!newBooking?.id) {
      throw new Error("Falha ao registrar o agendamento no banco de dados.");
    }

    console.log(`[Action createBooking] Reserva ${newBooking.id} criada com sucesso para User ID: ${userId}.`);

    revalidatePath('/');
    revalidatePath('/bookings');

    return newBooking;

  } catch (error) {
    console.error(`[Action createBooking] ERRO DETALHADO ao criar reserva para User ID ${userId}:`, error);
    
    throw new Error("Ocorreu um erro inesperado ao criar seu agendamento. Por favor, tente novamente.");
  }
};