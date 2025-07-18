// app/api/barbershop/route.ts

import { NextResponse } from 'next/server';
import db from '@/app/_lib/db'; // Sua conexão direta com o banco ('pg')

export async function GET() {
  try {
    // A query SQL foi modificada para buscar apenas UM resultado,
    // garantindo consistência ao ordenar por data de criação.
    const query = 'SELECT * FROM "Barbershop" ORDER BY "createdAt" ASC LIMIT 1';
    
    const result = await db.query(query);
    
    // Pegamos o primeiro (e único) objeto do array de resultados.
    const barbershop = result.rows[0];

    // Se, por algum motivo, nenhuma barbearia for encontrada no banco,
    // retornamos um erro 404 (Not Found).
    if (!barbershop) {
      return NextResponse.json({ error: 'Nenhuma barbearia encontrada' }, { status: 404 });
    }

    // Retornamos o objeto único da barbearia.
    // É este objeto que o `useSWR` no seu componente cliente receberá.
    return NextResponse.json(barbershop, { status: 200 });

  } catch (error) {
    console.error('Erro ao buscar a barbearia principal:', error);
    return NextResponse.json({ message: 'Erro interno do servidor.' }, { status: 500 });
  }
}