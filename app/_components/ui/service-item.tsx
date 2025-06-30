'use client'

import { Barbershop, BarbershopService, Booking } from '@prisma/client' // Certifique-se de que Booking está importado
import Image from 'next/image'

import { ptBR } from 'date-fns/locale'
import { useEffect, useMemo, useState } from 'react'
import { format, isPast, isToday, set } from 'date-fns'
// CERTIFIQUE-SE que este caminho está correto para sua action
import { createBooking } from '../../_actions/create-booking'
import { useSession } from 'next-auth/react'
import { Session } from 'next-auth' // Manter para estender

import { toast } from 'sonner'
// CERTIFIQUE-SE que este caminho está correto para sua action
import { getbookings } from '../../_actions/get-bookings' // Presume-se que retorna Booking[]

import SignInDialog from './sign-in-dialog'
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
import { Calendar } from './calendar' // Assuming this uses react-day-picker
import { Dialog, DialogContent } from './dialog'

// Interface ExtendedSession (convertida para type para resolver avisos do linter)
type ExtendedSession = Session & {
  // Usando interseção para estender Session
  user: Session['user'] & {
    // Garante que todas as props de Session["user"] estão presentes e adiciona/sobrescreve
    id: string
    name: string // Pode ser redundante se Session["user"] já tiver, mas garante que é string
    email: string // Idem
    image: string // Idem
    isAdmin?: boolean
  }
}

// Interface ServiceItemProps (convertida para type)
type ServiceItemProps = {
  service: Omit<BarbershopService, 'price' | 'createdAt' | 'updatedAt'> & {
    price: number | string // Mantido como string | number para flexibilidade com Prisma Decimal
    createdAt: string | Date // Mantido como string | Date para flexibilidade com serialização
    updatedAt: string | Date // Mantido como string | Date
  }
  barbershop: Omit<Barbershop, 'createdAt' | 'updatedAt'> & {
    createdAt: string | Date
    updatedAt: string | Date
  }
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

// Função getTimeList espera Booking[] agora
const getTimeList = (bookings: Booking[], selectedDay: Date): string[] => {
  // Adicionado tipo de retorno explícito
  return TIME_LIST.filter((time) => {
    const [hour, minutes] = time.split(':').map(Number)
    const dateWithTime = set(selectedDay, { hours: hour, minutes })
    // A lógica original para isPast e isToday:
    // const timeIsOnThePast = isPast(dateWithTime);
    // if (timeIsOnThePast && isToday(selectedDay)) return false;
    // Pode ser simplificada e mais precisa:
    if (isToday(selectedDay) && isPast(dateWithTime)) return false // Se for hoje e a hora já passou
    if (isPast(selectedDay) && !isToday(selectedDay)) return false // Se a data selecionada for um dia passado (não hoje)

    const hasBookingOnCurrentTime = bookings.some((booking) => {
      const bookingDate = new Date(booking.date) // booking.date é esperado aqui
      return (
        bookingDate.getHours() === hour && bookingDate.getMinutes() === minutes
      )
    })
    if (hasBookingOnCurrentTime) return false
    return true
  })
}

const ServiceItem = ({ service, barbershop }: ServiceItemProps) => {
  const { data: session } = useSession() as { data: ExtendedSession | null }
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string | undefined>(
    undefined,
  )

  const [dayBookings, setDayBookings] = useState<Booking[]>([])

  const [bookingSheeetIsOpen, setBookingSheeetIsOpen] = useState(false)
  const [signInDialogIsOpen, setSignInDialogIsOpen] = useState(false)
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false)
  const [isLoadingDayBookings, setIsLoadingDayBookings] = useState(false)

  useEffect(() => {
    if (!selectedDay) {
      setDayBookings([])
      return
    }
    const fetchDayBookings = async () => {
      setIsLoadingDayBookings(true)
      try {
        const bookings = await getbookings({
          date: selectedDay,
          serviceId: service.id,
        })
        setDayBookings(bookings) // setDayBookings agora espera Booking[]
      } catch (error) {
        console.error(
          '[ServiceItem] Erro ao buscar agendamentos do dia:',
          error,
        )
        toast.error('Erro ao carregar horários disponíveis.')
      } finally {
        setIsLoadingDayBookings(false)
      }
    }
    fetchDayBookings()
  }, [selectedDay, service.id])

  const timeList = useMemo(() => {
    if (!selectedDay) return []

    return getTimeList(dayBookings, selectedDay)
  }, [dayBookings, selectedDay])

  const handleBookingClick = () => {
    if (!session?.user?.id) {
      setSignInDialogIsOpen(true)
    } else {
      setBookingSheeetIsOpen(true)
    }
  }

  const handleDateSelect = (date: Date | undefined) => {
    // Tipo do parâmetro já estava correto
    if (date && (date.getDay() === 0 || date.getDay() === 1)) {
      // Adicionar um feedback ao usuário pode ser útil aqui, ex: toast.info(...)
      return
    }
    setSelectedDay(date)
    setSelectedTime(undefined)
  }

  const handleTimeSelected = (time: string) => {
    // Tipo do parâmetro já estava correto
    setSelectedTime(time)
  }

  const handleCreateBooking = async () => {
    if (!session?.user?.id || !selectedDay || !selectedTime) {
      // Checagem mais específica por user.id
      console.warn(
        '[ServiceItem] Tentativa de agendar sem sessão, data ou hora.',
      )
      toast.warning('Selecione uma data e hora para agendar.')
      return
    }

    setIsSubmittingBooking(true)
    console.log('[ServiceItem] Tentando criar reserva...')
    console.log('Dados para Action:', {
      serviceId: service.id,
      selectedDay,
      selectedTime,
    })

    try {
      const [hourStr, minuteStr] = selectedTime.split(':') // Renomeado para evitar conflito com 'hour' e 'minute' de date-fns/set
      const hour = parseInt(hourStr, 10) // Usar parseInt com radix
      const minute = parseInt(minuteStr, 10) // Usar parseInt com radix

      const bookingDate = set(selectedDay, {
        minutes: minute,
        hours: hour,
        seconds: 0,
        milliseconds: 0,
      })
      console.log('Data Final para Action:', bookingDate)

      await createBooking({
        serviceId: service.id,
        date: bookingDate,
      })

      handleCloseAndResetSheet()
      toast.success(
        `Reserva para ${format(bookingDate, "dd/MM 'às' HH:mm", { locale: ptBR })} realizada!`,
        {
          style: {
            color: '#9bfd09',
          },
        },
      )
    } catch (error) {
      console.error(
        '[ServiceItem] Erro ao criar reserva (capturado no cliente):',
        error,
      )
      if (error instanceof Error) {
        toast.error(`Falha ao agendar: ${error.message}`)
      } else {
        toast.error('Ocorreu um erro inesperado ao tentar agendar.')
      }
    } finally {
      setIsSubmittingBooking(false)
    }
  }

  const handleCloseAndResetSheet = () => {
    setSelectedDay(undefined)
    setSelectedTime(undefined)
    setBookingSheeetIsOpen(false)
  }

  return (
    <>
      <Card className="border-[#9c6a1c rounded-md border-[#9c6a1c] bg-card shadow-[1px_1px_0px_#9c6a1c,-1px_-1px_0px_#9c6a1c]">
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
            <p className="text-sm text-[white]">{service.description}</p>
            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold text-[#FFD700]">
                {Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(Number(service.price))}
              </p>

              <Sheet
                open={bookingSheeetIsOpen}
                onOpenChange={(isOpen: boolean) => {
                  if (!isOpen) {
                    handleCloseAndResetSheet()
                  }
                  setBookingSheeetIsOpen(isOpen)
                }}>
                <SheetTrigger asChild>
                  <Button
                    variant="secondary"
                    size="sm" // Mantenha ou remova dependendo da sua biblioteca
                    // Adicione ml-2 ou ml-3 ou ml-4 aqui para margem à esquerda
                    className="rounded-full border-0 bg-[#9c6a1c] px-2 ml-2 font-bold text-white hover:bg-opacity-90" // MODIFICADO AQUI
                    style={{ fontSize: '0.8rem' }} // Ajuste o tamanho da fonte
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
                      onSelect={handleDateSelect} // handleDateSelect já está tipado
                      fromDate={new Date()}
                      disabled={
                        (
                          date: Date, // Adicionado tipo explícito para 'date'
                        ) =>
                          date.getDay() === 0 ||
                          date.getDay() === 1 ||
                          (isPast(date) && !isToday(date)) // Desabilita dias passados que não sejam hoje
                      }
                      className="mt-0 flex justify-center"
                      styles={{
                        head_cell: { textTransform: 'capitalize' },
                        cell: {},
                        button: {},
                        nav_button_previous: { width: '32px', height: '32px' },
                        nav_button_next: { width: '32px', height: '32px' },
                        caption: { textTransform: 'capitalize' },
                      }}
                      modifiersStyles={{
                        selected: {
                          backgroundColor: '#65b8ff',
                          color: 'black',
                          fontWeight: 'bold',
                        },
                        disabled: {
                          color: '#666',
                          cursor: 'not-allowed',
                          opacity: 0.5,
                        }, // Melhorado estilo para disabled
                      }}
                    />
                  </div>

                  {selectedDay && (
                    <div className="flex gap-3 overflow-x-auto border-b-2 border-solid border-[#844816] p-5 [&::-webkit-scrollbar]:hidden">
                      {isLoadingDayBookings ? (
                        <p className="text-xs text-gray-400">Carregando...</p>
                      ) : timeList.length > 0 ? (
                        timeList.map(
                          (
                            time: string, // Adicionado tipo explícito para 'time'
                          ) => (
                            <Button
                              key={time}
                              variant="outline"
                              className={`rounded-full border-2 border-[#65b8ff] px-3 py-1 text-sm ${selectedTime === time ? 'bg-[#00B0FF] font-bold text-black' : 'text-white'}`}
                              onClick={() => handleTimeSelected(time)}>
                              {' '}
                              {time}{' '}
                            </Button>
                          ),
                        )
                      ) : (
                        <p className="text-sm font-semibold text-gray-400">
                          Sem horários disponíveis.
                        </p>
                      )}
                    </div>
                  )}

                  {selectedDay && selectedTime && (
                    <div className="p-5">
                      <Card className="border-2 border-[#844816]">
                        <CardContent className="space-y-3 p-3">
                          <div className="flex items-center justify-between">
                            {' '}
                            <h2>{service.name}</h2>{' '}
                            <p className="text-lg font-bold text-[#FFD700]">
                              {' '}
                              {Intl.NumberFormat('pt-BR', {
                                style: 'currency',
                                currency: 'BRL',
                              }).format(Number(service.price))}{' '}
                            </p>{' '}
                          </div>
                          <div className="flex items-center justify-between">
                            {' '}
                            <h2>Data</h2>{' '}
                            <p className="font-semibold capitalize text-white">
                              {' '}
                              {format(selectedDay, "d 'de' MMMM", {
                                locale: ptBR,
                              })}{' '}
                            </p>{' '}
                          </div>
                          <div className="flex items-center justify-between">
                            {' '}
                            <h2>Horário</h2>{' '}
                            <p className="font-semibold text-white">
                              {selectedTime}
                            </p>{' '}
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="font-semibold">
                              {barbershop.name}
                            </p>{' '}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  <SheetFooter className="border-t-2 border-solid border-[#844816] px-5 pb-5 pt-2">
                    <Button
                      className="w-full rounded-full bg-[#844816] font-extrabold text-white hover:bg-opacity-90 disabled:opacity-50"
                      size="lg"
                      onClick={handleCreateBooking}
                      disabled={
                        !selectedDay || !selectedTime || isSubmittingBooking
                      }>
                      {isSubmittingBooking
                        ? 'Confirmando...'
                        : 'Confirmar Reserva'}
                    </Button>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={signInDialogIsOpen}
        onOpenChange={(open: boolean) => setSignInDialogIsOpen(open)}>
        {' '}
        {/* Adicionado tipo explícito para 'open' */}
        <DialogContent className="w-[90%] max-w-sm bg-black text-white">
          {' '}
          <SignInDialog />{' '}
        </DialogContent>
      </Dialog>
    </>
  )
}
export default ServiceItem
