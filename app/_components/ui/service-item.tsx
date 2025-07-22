// app/_components/ui/service-item.tsx

'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { format, isPast, isToday, set } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'

// Importando nossa lógica de autenticação customizada
import { useAuth } from '@/app/_context/AuthContext'

// Importando nossas Server Actions refatoradas
import { createBooking } from '@/app/_actions/create-booking'
import { getbookings } from '@/app/_actions/get-bookings'

// Importando componentes de UI
import { Card, CardContent } from './card'
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './sheet'
import { Button } from './button'
import { Calendar } from './calendar'
import { Dialog, DialogContent } from './dialog'
import SignInDialog from './sign-in-dialog'
import { formatCurrency } from '@/app/_lib/utils'

// Definindo os tipos (interfaces) para os dados que o componente manipula
interface Barbershop {
  id: string
  name: string
}
interface Service {
  id: string
  name: string
  description: string
  imageUrl: string
  price: string | number
}
interface ServiceItemProps {
  service: Service
  barbershop: Barbershop
}
interface Booking {
  date: Date
}

const TIME_LIST = [
  '08:30',
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '12:00',
  '12:30',
  '13:00',
  '13:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
  '17:00',
  '17:30',
  '18:00',
  '18:30',
  '19:00',
]

// Função para filtrar os horários disponíveis
const getTimeList = (bookings: Booking[], selectedDay: Date): string[] => {
  return TIME_LIST.filter((time) => {
    const [hour, minutes] = time.split(':').map(Number)
    const dateWithTime = set(selectedDay, { hours: hour, minutes })

    if (isPast(dateWithTime) && isToday(selectedDay)) return false
    if (isPast(selectedDay) && !isToday(selectedDay)) return false

    const hasBookingOnCurrentTime = bookings.some(
      (booking) => new Date(booking.date).getTime() === dateWithTime.getTime(),
    )

    return !hasBookingOnCurrentTime
  })
}

const ServiceItem = ({ service, barbershop }: ServiceItemProps) => {
  const { user } = useAuth()

  const [selectedDay, setSelectedDay] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string | undefined>(
    undefined,
  )
  const [dayBookings, setDayBookings] = useState<Booking[]>([])
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isSignInDialogOpen, setIsSignInDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingTime, setIsLoadingTime] = useState(false)

  useEffect(() => {
    if (!selectedDay) {
      setDayBookings([])
      return
    }
    const fetchDayBookings = async () => {
      setIsLoadingTime(true)
      try {
        const bookings = await getbookings({
          barbershopId: barbershop.id,
          date: selectedDay,
        })
        setDayBookings(bookings)
      } catch (error) {
        toast.error('Erro ao carregar horários disponíveis.')
      } finally {
        setIsLoadingTime(false)
      }
    }
    fetchDayBookings()
  }, [selectedDay, barbershop.id])

  const timeList = useMemo(() => {
    if (!selectedDay) return []
    return getTimeList(dayBookings, selectedDay)
  }, [dayBookings, selectedDay])

  const handleBookingClick = () => {
    if (!user) {
      setIsSignInDialogOpen(true)
    } else {
      setIsSheetOpen(true)
    }
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (date && (date.getDay() === 0 || date.getDay() === 1)) return
    setSelectedDay(date)
    setSelectedTime(undefined)
  }

  const handleTimeSelected = (time: string) => {
    setSelectedTime(time)
  }

  const handleCreateBooking = async () => {
    if (!user?.userId || !selectedDay || !selectedTime) {
      toast.warning('Selecione uma data e hora para agendar.')
      return
    }

    setIsSubmitting(true)

    try {
      const [hour, minute] = selectedTime.split(':').map(Number)
      const bookingDate = set(selectedDay, { hours: hour, minutes: minute })

      await createBooking({
        serviceId: service.id,
        barbershopId: barbershop.id,
        date: bookingDate,
        userId: user.userId,
      })

      window.dispatchEvent(new Event('booking:created'))
      handleCloseAndResetSheet()
      toast.success(
        `Reserva para ${format(bookingDate, "dd/MM 'às' HH:mm", { locale: ptBR })} realizada!`,
        {
          style: { color: '#9bfd09' },
        },
      )
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Ocorreu um erro ao agendar.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCloseAndResetSheet = () => {
    setSelectedDay(undefined)
    setSelectedTime(undefined)
    setIsSheetOpen(false)
  }

  return (
    <>
      <Card className="rounded-md border-[#9c6a1c] bg-card shadow-[1px_1px_0px_#9c6a1c,-1px_-1px_0px_#9c6a1c]">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="relative max-h-[110px] min-h-[110px] min-w-[110px] max-w-[110px]">
            <Image
              alt={service.name}
              src={service.imageUrl}
              fill
              sizes="(max-width: 110px) 100vw, 110px"
              className="rounded-lg object-cover shadow-sm"
            />
          </div>
          <div className="flex w-full flex-col justify-between space-y-2">
            <h3 className="text-lg text-[#FFD700]">{service.name}</h3>
            <p className="text-white">{service.description}</p>
            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold text-[#FFD700]">
                {formatCurrency(service.price)}
              </p>
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="secondary"
                    className="rounded-full border-0 bg-[#9c6a1c] px-2 font-bold text-white hover:bg-opacity-90"
                    onClick={handleBookingClick}>
                    Reservar
                  </Button>
                </SheetTrigger>
                <SheetContent className="overflow-y-auto border-2 border-b-0 border-[#844816] bg-black px-0 text-white">
                  <SheetHeader className="border-b-2 border-solid border-[#844816] px-5 py-3">
                    <SheetTitle>Fazer Reserva</SheetTitle>
                  </SheetHeader>
                  <div className="border-b-2 border-solid border-[#844816] px-5 py-5">
                    <Calendar
                      mode="single"
                      locale={ptBR}
                      selected={selectedDay}
                      onSelect={handleDateSelect}
                      fromDate={new Date()}
                      disabled={(date) =>
                        date.getDay() === 0 ||
                        date.getDay() === 1 ||
                        (isPast(date) && !isToday(date))
                      }
                    />
                  </div>
                  {selectedDay && (
                    <div className="flex gap-3 overflow-x-auto border-b-2 border-solid border-[#844816] p-5 [&::-webkit-scrollbar]:hidden">
                      {isLoadingTime ? (
                        <p className="text-xs text-gray-400">
                          Carregando horários...
                        </p>
                      ) : timeList.length > 0 ? (
                        timeList.map((time) => (
                          <Button
                            key={time}
                            variant={
                              selectedTime === time ? 'default' : 'outline'
                            }
                            className="rounded-full"
                            onClick={() => handleTimeSelected(time)}>
                            {time}
                          </Button>
                        ))
                      ) : (
                        <p className="text-sm font-semibold text-gray-400">
                          Sem horários disponíveis.
                        </p>
                      )}
                    </div>
                  )}

                  {/* ESTE É O BLOCO DE CÓDIGO QUE GERA O RESUMO */}
                  {selectedDay && selectedTime && (
                    <div className="px-5 pt-3">
                      <Card className="border-2 border-[#844816] bg-[#1A1A1A] text-white">
                        <CardContent className="flex flex-col gap-3 p-3">
                          <div className="flex justify-between">
                            <h3 className="font-bold">{service.name}</h3>
                            <p className="text-lg font-bold text-[#FFD700]">
                              {formatCurrency(service.price)}
                            </p>
                          </div>
                          <div className="border-t border-solid border-zinc-700" />
                          <div className="flex justify-between">
                            <p className="text-sm font-semibold">Data</p>
                            <p className="text-sm font-semibold capitalize">
                              {format(selectedDay, "dd 'de' MMMM", {
                                locale: ptBR,
                              })}
                            </p>
                          </div>
                          <div className="flex justify-between">
                            <p className="text-sm font-semibold">Horário</p>
                            <p className="text-sm font-semibold">
                              {selectedTime}
                            </p>
                          </div>
                          <div className="flex justify-between">
                            
                            <p className="text-sm font-semibold">
                              {barbershop.name}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  <SheetFooter className="mt-3 border-t-2 border-solid border-[#844816] px-5 py-3">
                    <Button
                      onClick={handleCreateBooking}
                      disabled={!selectedDay || !selectedTime || isSubmitting}
                      className="h-11 w-full bg-[#9c6a1c] text-base font-bold hover:bg-[#b5812e]">
                      {isSubmitting ? 'Confirmando...' : 'Confirmar Reserva'}
                    </Button>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </CardContent>
      </Card>
      <Dialog open={isSignInDialogOpen} onOpenChange={setIsSignInDialogOpen}>
        <DialogContent className="w-[90%] max-w-sm bg-black text-white">
          <SignInDialog onLoginSuccess={() => setIsSignInDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ServiceItem
