// app/adm/AdminBookingsListClient.tsx

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'

// Importa o tipo diretamente da nossa Server Action
import {
  getAllAdminBookings,
  type BookingAdminListData,
} from '../_actions/get-all-admin-bookings'

// Importa o componente do card
import BookingCardAdmin from '../_components/ui/bookingCardAdmin'

const AdminBookingsListClient = () => {
  const [bookings, setBookings] = useState<BookingAdminListData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Função para buscar os agendamentos (pode ser chamada para atualização)
  const fetchBookings = useCallback(async () => {
    try {
      const data = await getAllAdminBookings()
      setBookings(data)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Erro ao buscar agendamentos.',
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Busca os dados na carga inicial
  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  // Implementação do Polling para manter a lista atualizada
  useEffect(() => {
    const intervalId = setInterval(() => {
      console.log('[Admin Polling] Verificando novos agendamentos...')
      fetchBookings()
    }, 10000) // Verifica a cada 10 segundos

    return () => clearInterval(intervalId)
  }, [fetchBookings])

  if (isLoading) {
    return (
      <p className="text-center text-gray-400">Carregando agendamentos...</p>
    )
  }

  return (
    <>
      {bookings.length > 0 ? (
        <div className="flex flex-col gap-4">
          {bookings.map((booking) => (
            <BookingCardAdmin
              key={booking.id}
              booking={booking}
              onBookingDeleted={fetchBookings} // Passa a função para que o card possa acionar uma atualização
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-400">
          Nenhum agendamento encontrado.
        </p>
      )}
    </>
  )
}

export default AdminBookingsListClient
