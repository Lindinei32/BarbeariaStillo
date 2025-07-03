// app/api/barbershop/route.ts

import { NextResponse } from 'next/server'
// <<< AÇÃO 1: Importar o Prisma Client diretamente >>>
import { db } from '@/app/_lib/prisma' // Verifique se este caminho está correto

export async function GET() {
  try {
    // <<< AÇÃO 2: Colocar a lógica do banco de dados diretamente aqui >>>
    // Esta lógica é a mesma que estava na sua Server Action.
    const barbershop = await db.barbershop.findFirst({
      select: {
        openingTime: true,
        closingTime: true,
      },
      orderBy: {
        createdAt: 'asc', // É uma boa prática ordenar para garantir que você sempre pegue o mesmo registro
      },
    })

    // Se nenhuma barbearia for encontrada, retorne um erro claro.
    if (!barbershop) {
      return NextResponse.json(
        { error: 'Barbearia não encontrada' },
        { status: 404 },
      )
    }

    // Se encontrar, retorne os dados.
    return NextResponse.json(barbershop)
  } catch (error) {
    console.error('ERRO NA API /api/barbershop:', error)
    // Retorna um erro genérico caso algo dê errado com o banco de dados.
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 },
    )
  }
}
