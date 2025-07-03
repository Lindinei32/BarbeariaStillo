// app/api/barbershop/route.ts

import { NextResponse } from 'next/server'
import { db } from '@/app/_lib/prisma'

// ===================================================================
// <<< ADICIONE ESTA LINHA PARA DESABILITAR O CACHE DESTA ROTA >>>
export const dynamic = 'force-dynamic'
// ===================================================================

export async function GET() {
  try {
    const barbershop = await db.barbershop.findFirst({
      select: {
        openingTime: true,
        closingTime: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    if (!barbershop) {
      return NextResponse.json(
        { error: 'Barbearia não encontrada' },
        { status: 404 },
      )
    }

    return NextResponse.json(barbershop)
  } catch (error) {
    console.error('ERRO NA API /api/barbershop:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 },
    )
  }
}
