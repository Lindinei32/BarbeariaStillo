// app/_components/ui/BookingCardAdmin.tsx

'use client'

import React, { useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/app/_components/ui/avatar'
import { Card, CardContent } from '@/app/_components/ui/card'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/app/_components/ui/dialog'
import { toast } from 'sonner'
import { deleteBooking } from '@/app/_actions/delete-booking'
import { Button } from '@/app/_components/ui/button'

// ===================================================================
// 1. ATUALIZAMOS A INTERFACE para incluir o telefone do usuário
// ===================================================================
interface BookingUser {
  name: string | null
  image: string | null
  phone: string | null // <-- CAMPO ADICIONADO
}

interface BookingService {
  name: string
}

interface BookingAdminData {
  id: string
  date: Date
  user: BookingUser | null
  service: BookingService | null
}

interface BookingCardAdminProps {
  booking: BookingAdminData
  onBookingDeleted: (_bookingId: string) => void
}

const formatBookingDateTime = (date: Date, formatString: string) => {
  try {
    const validDate = date instanceof Date ? date : new Date(date)
    if (Number.isNaN(validDate.getTime())) {
      throw new Error('Data inválida recebida')
    }
    return format(validDate, formatString, { locale: ptBR })
  } catch (error) {
    console.error('Erro ao formatar data:', error)
    return 'Inválido'
  }
}

export default function BookingCardAdmin({
  booking,
  onBookingDeleted,
}: BookingCardAdminProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleCancelBooking = async () => {
    if (!booking.id) {
      console.error('Booking ID é inválido')
      return
    }
    setIsDeleting(true)
    try {
      await deleteBooking(booking.id)
      setIsDialogOpen(false)
      toast.success('Reserva cancelada com sucesso!')
      onBookingDeleted(booking.id)
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Erro ao cancelar reserva: ${error.message}`)
      } else {
        toast.error('Erro ao cancelar reserva. Tente novamente.')
      }
    } finally {
      setIsDeleting(false)
    }
  }

  const userImage = booking.user?.image || undefined
  const userName = booking.user?.name || 'Cliente'
  const userFallback = userName?.charAt(0).toUpperCase() || 'C'
  const formattedTime = formatBookingDateTime(booking.date, 'HH:mm')
  const formattedDateShort = formatBookingDateTime(
    booking.date,
    'dd MMM',
  ).replace(/\b\w/g, (letter) => letter.toUpperCase())
  const formattedFullDate = formatBookingDateTime(
    booking.date,
    "dd/MM/yyyy 'às' HH:mm",
  )

  return (
    <>
      {isDeleting && (
        <div className="fixed left-0 top-0 z-50 flex h-full w-full items-center justify-center bg-black bg-opacity-50">
          <svg
            className="h-10 w-10 animate-spin rounded-full border-2 border-white border-t-transparent"
            viewBox="0 0 24 24"
          />
        </div>
      )}
      <Card className="border-2 border-[#daa520] bg-transparent">
        <CardContent className="flex flex-row items-center justify-between gap-2 p-3 sm:gap-4 sm:p-4">
          <div className="flex items-center gap-2 overflow-hidden sm:gap-3">
            <Avatar className="h-10 w-10 flex-shrink-0 rounded-full border-2 border-[#daa520] bg-black sm:h-12 sm:w-12">
              <AvatarImage src={userImage} alt={`Avatar de ${userName}`} />
              <AvatarFallback>{userFallback}</AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col">
              <p className="truncate text-sm font-semibold text-white sm:text-base">
                {userName}
              </p>

              {/* =================================================================== */}
              {/* 2. ADICIONAMOS A EXIBIÇÃO DO TELEFONE                             */}
              {/* =================================================================== */}
              {booking.user?.phone && (
                <p className="truncate text-xs font-semibold text-white sm:text-sm">
                  {booking.user.phone}
                </p>
              )}

              <p className="truncate text-xs font-semibold text-white sm:text-sm">
                {booking.service?.name ?? 'Serviço'}
              </p>
            </div>
          </div>

          <div className="flex flex-shrink-0 flex-col items-center px-1 text-center sm:px-2">
            <p className="text-sm font-bold text-white sm:text-lg">
              {formattedTime}
            </p>
            <p className="text-xs font-semibold text-white sm:text-sm">
              {formattedDateShort}
            </p>
          </div>

          <div className="flex flex-shrink-0 items-center">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  className="border-2 border-[#FF143C] px-2 font-bold sm:px-3">
                  Excluir
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[90%] max-w-md border-[#FF143C] bg-black text-white">
                <DialogHeader>
                  <DialogTitle className="text-white">
                    Cancelar Reserva?
                  </DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Esta ação não pode ser desfeita. A reserva para{' '}
                    <span className="font-medium text-[#daa520]">
                      {booking.service?.name}
                    </span>{' '}
                    em{' '}
                    <span className="font-medium text-[#daa520]">
                      {formattedFullDate}
                    </span>{' '}
                    será permanentemente excluída.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <DialogClose asChild>
                    <Button
                      type="button"
                      variant="secondary"
                      className="w-full ..."
                      disabled={isDeleting}>
                      Voltar
                    </Button>
                  </DialogClose>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleCancelBooking}
                    className="w-full ..."
                    disabled={isDeleting}>
                    {isDeleting ? 'Excluindo...' : 'Confirmar Exclusão'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
