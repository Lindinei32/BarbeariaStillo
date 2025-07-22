// app/_actions/update-barbershop-hours.ts

'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import db from '@/app/_lib/db'

interface UpdateHoursParams {
  barbershopId: string
  openingTime: string
  closingTime: string
}

export const updateBarbershopHours = async (params: UpdateHoursParams) => {
  const { barbershopId, openingTime, closingTime } = params

  if (!barbershopId || !openingTime || !closingTime) {
    throw new Error('Todos os campos são obrigatórios.')
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
      SET "openingTime" = $1, "closingTime" = $2
      WHERE id = $3;
    `

    await db.query(updateQuery, [openingTime, closingTime, barbershopId])

    console.log(
      `Horários da barbershop ${barbershopId} atualizados com sucesso.`,
    )

    // ===================================================================
    // A CORREÇÃO PRINCIPAL ACONTECE AQUI
    // ===================================================================
    // Invalidamos o cache da página principal, da página de admin E da API
    // que o componente HomeClient consome.
    revalidatePath('/')
    revalidatePath('/adm')
    revalidatePath('/api/barbershop') // <-- ESTA É A LINHA CRUCIAL
  } catch (error) {
    console.error('Erro ao atualizar horários da barbershop:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Ocorreu um erro inesperado ao atualizar os horários.')
  }
}
