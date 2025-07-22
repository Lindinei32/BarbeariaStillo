// app/_actions/clear-barbershop-hours.ts

'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import db from '@/app/_lib/db'

export const clearBarbershopHours = async (barbershopId: string) => {
  if (!barbershopId) {
    throw new Error('ID da barbearia é obrigatório.')
  }

  try {
    const token = cookies().get('auth_token')?.value
    if (!token) {
      throw new Error('Não autorizado: Faça o login como administrador.')
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      isAdmin: boolean
    }

    if (!decoded.isAdmin) {
      throw new Error(
        'Acesso negado: Apenas administradores podem executar esta ação.',
      )
    }

    const updateQuery = `
      UPDATE "Barbershop"
      SET "openingTime" = NULL, "closingTime" = NULL
      WHERE id = $1;
    `

    await db.query(updateQuery, [barbershopId])

    console.log(`Horários da barbearia ${barbershopId} limpos com sucesso.`)

    // ===================================================================
    // A CORREÇÃO ESTÁ AQUI: Invalidamos o cache após a limpeza
    // ===================================================================
    revalidatePath('/')
    revalidatePath('/adm')
    revalidatePath('/api/barbershop') // <-- ADICIONE ESTA LINHA
  } catch (error) {
    console.error('Erro ao limpar horários da barbearia:', error)
    if (error instanceof Error) {
      throw new Error(error.message)
    }
    throw new Error('Ocorreu um erro inesperado ao limpar os horários.')
  }
}
