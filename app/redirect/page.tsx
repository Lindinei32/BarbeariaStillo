// app/redirect/page.tsx

import { getServerSession } from 'next-auth'
import { authOptions } from '../_lib/auth'
import { redirect } from 'next/navigation'

export default async function RedirectPage() {
  const session = await getServerSession(authOptions)

  // VERSÃO FINALMENTE CORRIGIDA:
  // Verifica se o usuário está logado e se sua propriedade "isAdmin" é verdadeira.
  if (session?.user?.isAdmin) {
    redirect('/adm')
  } else {
    redirect('/')
  }
}
