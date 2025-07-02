// app/adm/page.tsx

'use client'

import { useEffect, useState, useCallback, FormEvent } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

// Suas importações
// import { BookingWithIncludes } from '../_components/ui/bookingCardAdmin'
import Header from '../_components/ui/header'
import BookingCardAdmin from '../_components/ui/bookingCardAdmin'
import AdminHoursForm from '../_components/ui/admin-hours-form'

// Actions
import { getAllAdminBookings } from '../_actions/get-all-admin-bookings'
import { getBarbershopData } from '../_actions/get-barbershop-data'
import { updateBarbershopHours } from '../_actions/update-barbershop-hours'
import { clearBarbershopHours } from '../_actions/clear-barbershop-hours'

import { Barbershop } from '@prisma/client'

export default function AdmPage() {
  const [bookings, setBookings] = useState<import('../_actions/get-all-admin-bookings').BookingAdminListData[]>([])
  const [barbershop, setBarbershop] = useState<Barbershop | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingBookings, setIsLoadingBookings] = useState(true)

  const { data: session, status } = useSession()
  const router = useRouter()

  const fetchAndUpdateBookings = useCallback(async (isInitialLoad = false) => {
    if (isInitialLoad) setIsLoadingBookings(true)
    try {
      const data = await getAllAdminBookings()
      setBookings(data)
    } catch (error) {
      toast.error('Erro ao buscar agendamentos.')
    } finally {
      setIsLoadingBookings(false)
    }
  }, [])

  const handleClearClick = useCallback(async () => {
    if (isSubmitting || !barbershop) return
    if (!confirm('Tem certeza que deseja limpar os horários?')) return

    setIsSubmitting(true)
    const toastId = toast.loading('Limpando horários...')
    try {
      await clearBarbershopHours(barbershop.id)

      const data = await getBarbershopData()
      setBarbershop(data as Barbershop) // 1. Atualiza a UI local

      router.refresh() // 2. Dispara a atualização de outras páginas

      toast.dismiss(toastId)
      toast.success('Horários limpos com sucesso!')
    } catch (error) {
      toast.dismiss(toastId)
      toast.error('Falha ao limpar os horários.')
    } finally {
      setIsSubmitting(false)
    }
  }, [barbershop, isSubmitting, router])

  const handleSaveSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      if (isSubmitting) return

      setIsSubmitting(true)
      const toastId = toast.loading('Salvando horários...')
      const formData = new FormData(event.currentTarget)

      try {
        await updateBarbershopHours(formData)

        const data = await getBarbershopData()
        setBarbershop(data as Barbershop) // 1. Atualiza a UI local

        router.refresh() // 2. Dispara a atualização de outras páginas

        toast.dismiss(toastId)
        toast.success('Horários salvos com sucesso!')
      } catch (error) {
        toast.dismiss(toastId)
        toast.error('Falha ao salvar os horários.')
      } finally {
        setIsSubmitting(false)
      }
    },
    [isSubmitting, router],
  )

  // Efeitos para busca inicial e polling
  useEffect(() => {
    if (status === 'authenticated') {
      getBarbershopData().then((data) => setBarbershop(data as Barbershop))
      fetchAndUpdateBookings(true)
    } else if (status === 'unauthenticated') {
      router.replace('/')
    }
  }, [status, router, fetchAndUpdateBookings])

  useEffect(() => {
    if (status === 'authenticated' && !isLoadingBookings) {
      const intervalId = setInterval(() => fetchAndUpdateBookings(false), 15000)
      return () => clearInterval(intervalId)
    }
  }, [status, isLoadingBookings, fetchAndUpdateBookings])

  // JSX do return
  if (status === 'loading' || !barbershop) {
    return (
      <div>
        <Header />
        <div className="p-5 text-center">Carregando...</div>
      </div>
    )
  }

  return (
    <div>
      <Header />
      <div className="p-5">
        <div className="mb-6 text-center text-xl font-extrabold text-white">
          Olá, {session?.user?.name || 'administrador'}!
        </div>

        <div className="container mx-auto mb-8 max-w-lg">
          <h2 className="mb-4 text-center text-lg font-bold italic">
            Gerenciar Horário de Funcionamento
          </h2>
          <AdminHoursForm
            barbershop={barbershop}
            onSaveSubmit={handleSaveSubmit}
            onClearClick={handleClearClick}
          />
        </div>

        <div className="container mx-auto max-w-lg">
          <h2 className="mb-4 text-center text-lg font-bold italic">
            Horários Agendados
          </h2>
          {isLoadingBookings ? (
            <p className="text-center text-gray-400">
              Carregando agendamentos...
            </p>
          ) : bookings.length > 0 ? (
            <div className="flex flex-col gap-4">
              {bookings.map((booking) => (
                <BookingCardAdmin
                  key={booking.id}
                  booking={booking}
                  onBookingDeleted={() => fetchAndUpdateBookings(true)}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400">
              Nenhum agendamento encontrado.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
