// app/_components/ui/welcome-message.tsx
'use client'

import { useAuth } from '@/app/_context/AuthContext'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const WelcomeMessage = () => {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div>
        <div className="h-7 w-48 animate-pulse rounded-md bg-gray-700" />
        <div className="mt-2 h-5 w-64 animate-pulse rounded-md bg-gray-700" />
      </div>
    )
  }

  return (
    <div>
      {/* =================================================================== */}
      {/* A LÓGICA DE EXIBIÇÃO CONDICIONAL ESTÁ AQUI                       */}
      {/* =================================================================== */}
      <h2 className="text-xl text-[#F5F5F5]">
        {
          // Se 'user' existir (estiver logado)...
          user 
            // ...mostra "Olá, [nome do usuário]!"
            ? `Olá, ${user.name} !` 
            // ...senão (se 'user' for null)...
            : 'Olá, Seja Bem-vindo!'
        }
      </h2>

      <p className="mt-2 font-semibold text-white">
        <span className="capitalize">
          {format(new Date(), 'EEEE, dd', { locale: ptBR })}
        </span>{' '}
        de{' '}
        <span>
          {format(new Date(), 'MMMM', { locale: ptBR })
            .charAt(0)
            .toUpperCase() +
            format(new Date(), 'MMMM', { locale: ptBR }).slice(1).toLowerCase()}
        </span>{' '}
        de <span>{format(new Date(), 'yyyy')}</span>
      </p>
    </div>
  )
}

export default WelcomeMessage