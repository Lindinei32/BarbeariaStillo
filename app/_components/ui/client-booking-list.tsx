// app/_components/ui/client-booking-list.tsx

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/app/_context/AuthContext'

// ===================================================================
// ESTA É A VERSÃO FINAL E CORRETA DO IMPORT
// Traz a função e o tipo do mesmo arquivo, com o nome correto.
// ===================================================================
import {
  getConfirmedBookings,
  type ConfirmedBookingClientSafe,
} from '@/app/_actions/get-confirmed-bookings'

import BookingItem from './booking-item'

export default function ClientBookingList() {
  const [bookings, setBookings] = useState<ConfirmedBookingClientSafe[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()

  const fetchBookings = useCallback(async () => {
    if (!user) {
      setBookings([])
      setIsLoading(false)
      return
    }

    try {
      const fetchedBookings = await getConfirmedBookings()
      setBookings(fetchedBookings)
    } catch (err) {
      console.error('[ClientBookingList] Error fetching bookings:', err)
      setBookings([])
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  useEffect(() => {
    if (user) {
      const intervalId = setInterval(() => {
        console.log('[Client Polling] Verificando agendamentos...')
        fetchBookings()
      }, 10000)

      return () => clearInterval(intervalId)
    }
  }, [user, fetchBookings])

  if (isLoading) {
    return (
      <div className="mt-6 px-5">
        <h2 className="mb-3 text-sm font-bold uppercase text-gray-400">
          Seus Agendamentos
        </h2>
        <div className="h-24 w-full animate-pulse rounded-lg bg-gray-800"></div>
      </div>
    )
  }

  if (!user || bookings.length === 0) {
    return null
  }

  return (
    <div className="mt-6 px-5">
      <h2 className="mb-3 text-sm font-bold uppercase ">
        Seus Agendamentos
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden">
        {bookings.map((booking) => (
          <BookingItem key={booking.id} booking={booking} />
        ))}
      </div>
    </div>
  )
}
