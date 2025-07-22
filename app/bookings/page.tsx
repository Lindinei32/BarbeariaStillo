// app/bookings/page.tsx

'use client' // Esta página precisa ser de cliente para usar hooks

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

// Importando nosso hook e componentes
import { useAuth } from '@/app/_context/AuthContext'
import Header from '../_components/ui/header'
import BookingItem from '../_components/ui/booking-item'

// Importando nossas Server Actions
import {
  getConfirmedBookings,
  type ConfirmedBookingClientSafe,
} from '../_actions/get-confirmed-bookings'
import { getConcludedBookings } from '../_actions/get-concluded-bookings'

export default function BookingsPage() {
  const [confirmedBookings, setConfirmedBookings] = useState<
    ConfirmedBookingClientSafe[]
  >([])
  const [concludedBookings, setConcludedBookings] = useState<
    ConfirmedBookingClientSafe[]
  >([])
  const [isLoading, setIsLoading] = useState(true)

  const { user, isLoading: isAuthLoading } = useAuth()
  const router = useRouter()

  // Efeito para proteger a rota e buscar os dados
  useEffect(() => {
    // Se a autenticação ainda está carregando, espera
    if (isAuthLoading) return

    // Se o usuário não estiver logado, redireciona para a home
    if (!user) {
      router.replace('/')
      return
    }

    // Se estiver logado, busca ambos os tipos de agendamento
    const fetchBookings = async () => {
      try {
        const [confirmed, concluded] = await Promise.all([
          getConfirmedBookings(),
          getConcludedBookings(),
        ])
        setConfirmedBookings(confirmed)
        setConcludedBookings(concluded)
      } catch (error) {
        console.error('Erro ao buscar agendamentos:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBookings()
  }, [user, isAuthLoading, router])

  if (isAuthLoading || isLoading) {
    return (
      <>
        <Header />
        <div className="p-5 text-center">Carregando seus agendamentos...</div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="px-5 py-6">
        <h1 className="text-xl font-bold">Meus Agendamentos</h1>

        {/* Seção de Agendamentos Confirmados */}
        <div className="mt-6">
          <h2 className="mb-3 font-bold uppercase text-gray-400">
            Confirmados
          </h2>
          <div className="flex flex-col gap-3">
            {confirmedBookings.length > 0 ? (
              confirmedBookings.map((booking) => (
                <BookingItem key={booking.id} booking={booking} />
              ))
            ) : (
              <p className="text-gray-500">Nenhum agendamento confirmado.</p>
            )}
          </div>
        </div>

        {/* Seção de Agendamentos Finalizados */}
        <div className="mt-6">
          <h2 className="mb-3 font-bold uppercase text-gray-400">
            Finalizados
          </h2>
          <div className="flex flex-col gap-3">
            {concludedBookings.length > 0 ? (
              concludedBookings.map((booking) => (
                <BookingItem key={booking.id} booking={booking} />
              ))
            ) : (
              <p className="text-gray-500">Nenhum agendamento finalizado.</p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
