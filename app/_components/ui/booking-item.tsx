// app/_components/ui/booking-item.tsx

"use client"

// IMPORTS REMOVIDOS
// import { Prisma } from "@prisma/client" // <-- REMOVIDO! Não usamos mais o Prisma.

// IMPORTS MANTIDOS
import { format, isFuture } from "date-fns"
import { ptBR } from "date-fns/locale"
import Image from "next/image"
import { toast } from "sonner"
import { useState } from "react"
import { useRouter } from "next/navigation";

// IMPORTS DE COMPONENTES E ACTIONS (MANTIDOS)
import PhoneItem from "./phone-item"
import BookingSummary from "./booking-summary"
import { deleteBooking } from "@/app/_actions/delete-booking"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./sheet"
import { Card, CardContent } from "./card"
import { Badge } from "./badge"
import { Avatar, AvatarImage } from "./avatar"
import { Button } from "./button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog"
import { DialogClose } from "@radix-ui/react-dialog"

// ===================================================================
// AÇÃO 1: CRIAR NOSSOS PRÓPRIOS TIPOS PARA SUBSTITUIR OS DO PRISMA
// ===================================================================

// Definimos a "forma" de uma barbearia para este componente
interface Barbershop {
  id: string;
  name: string;
  address: string;
  imageUrl: string;
  phones: string; // Vem como uma única string separada por vírgulas
}

// Definimos a "forma" de um serviço, que inclui a barbearia
interface Service {
  id: string;
  name: string;
  price: string; // Decimal do PG vem como string
  barbershop: Barbershop;
}

// Definimos o tipo principal do nosso componente: um agendamento (Booking)
interface Booking {
  id: string;
  date: Date;
  service: Service;
}

// O tipo das props agora usa a nossa interface 'Booking'
interface BookingItemProps {
  booking: Booking;
}

const BookingItem = ({ booking }: BookingItemProps) => {
  const router = useRouter(); 
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  
  // A lógica abaixo continua funcionando, pois definimos os tipos corretamente
  const { service: { barbershop } } = booking
  const isConfirmed = isFuture(booking.date)

  const handleCancelBooking = async () => {
    try {
      await deleteBooking(booking.id)
      setIsSheetOpen(false)
      router.refresh(); 
      toast.success("Reserva cancelada com sucesso!")
    } catch (error) {
      console.error(error)
      toast.error("Erro ao cancelar reserva. Tente novamente.")
    }
  }
  
  const handleSheetOpenChange = (isOpen: boolean) => {
    setIsSheetOpen(isOpen)
  }

  // ===================================================================
  // NENHUMA MUDANÇA É NECESSÁRIA NO JSX ABAIXO
  // ===================================================================
  // Todo o código de renderização permanece o mesmo, pois ele apenas
  // lê as propriedades do objeto 'booking' que continua tendo a mesma estrutura.

  return (
    <Sheet open={isSheetOpen} onOpenChange={handleSheetOpenChange}>
      <SheetTrigger className="w-full min-w-[90%] text-left">
        <Card className="min-w-[90%] border-2 border-[#daa520]">
          <CardContent className="flex justify-between p-0">
            {/* ESQUERDA */}
            <div className="flex flex-col gap-2 py-5 pl-5">
              <Badge
                className={`w-fit border-2 ${
                  isConfirmed
                    ? "border-[#72b603] text-[#dbe339]"
                    : "border-[#FF143C] text-[#FF143C]"
                }`}
                variant={isConfirmed ? "default" : "destructive"}
              >
                {isConfirmed ? "Confirmado" : "Finalizado"}
              </Badge>
              <h3>{booking.service.name}</h3>

              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={booking.service.barbershop.imageUrl} />
                </Avatar>
                <p className="text-lg text-white">
                  {booking.service.barbershop.name}
                </p>
              </div>
            </div>
            {/* DIREITA */}
            <div className="flex flex-col items-center justify-center border-l-2 border-solid border-[#FF9000] px-5">
              <p className="text-lg font-bold text-white">
                {format(booking.date, "HH:mm", { locale: ptBR })}
              </p>
              <p className="text-lg font-semibold text-white">
                {format(booking.date, "dd", { locale: ptBR })}
              </p>
              <p className="text-lg font-semibold capitalize text-white">
                {format(booking.date, "MMMM", { locale: ptBR })}
              </p>
            </div>
          </CardContent>
        </Card>
      </SheetTrigger>
      <SheetContent className="w-[85%] bg-[#121212] text-white border-2 border-[#844816]">
        <SheetHeader>
          <SheetTitle className="text-center">Informações da Reserva</SheetTitle>
        </SheetHeader>

        <a 
          href="https://www.google.com/maps/dir//Av.+Benjamin+Possebon,+1041+-+Quissisana,+S%C3%A3o+Jos%C3%A9+dos+Pinhais+-+PR"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className="relative mt-6 flex h-[180px] w-full items-end">
            <Image
              alt={`Mapa da barbearia ${booking.service.barbershop.name}`}
              src="/mapa2.png"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="rounded-xl object-cover"
            />
            <Card className="z-50 mx-5 mb-3 w-full rounded-xl border border-[#daa520] bg-black">
              <CardContent className="flex items-center gap-3 px-5 py-3">
                <Avatar>
                  <AvatarImage src={barbershop.imageUrl} />
                </Avatar>
                <div>
                  <h3>{barbershop.name}</h3>
                  <p className="text-xs">{barbershop.address}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </a>

        <div className="mt-6">
          <Badge
            className={`w-fit border-2 ${
              isConfirmed
                ? "border-[#72b603] text-[#dbe339]"
                : "border-[#FF143C] !text-[#ea0304]"
            }`}
            variant={isConfirmed ? "default" : "destructive"}
          >
            {isConfirmed ? "Confirmado" : "Finalizado"}
          </Badge>

          <div className="mb-3 mt-6">
            <BookingSummary
              barbershop={barbershop}
              service={JSON.parse(JSON.stringify(booking.service))}
              selectedDate={booking.date}
            />
          </div>

          <div className="space-y-3">
            {barbershop.phones.split(",").map((phone) => (
              <PhoneItem key={phone.trim()} phone={phone.trim()} />
            ))}
          </div>
        </div>
        <SheetFooter className="mt-6">
          <div className="flex items-center gap-3">
            <SheetClose asChild>
              <Button
                variant="outline"
                className="w-full border-2 border-[#daa520] rounded-lg"
              >
                Voltar
              </Button>
            </SheetClose>
            {isConfirmed && (
              <Dialog>
                <DialogTrigger asChild className="w-full">
                  <Button
                    variant="destructive"
                    className="w-full border-2 rounded-lg"
                    style={{ borderColor: "#FF143C" }}
                  >
                    Cancelar Reserva
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[90%] border-[#FF143C] bg-black">
                  <DialogHeader>
                    <DialogTitle>Deseja mesmo cancelar sua reserva?</DialogTitle>
                    <DialogDescription>
                      Ao cancelar, você perderá sua reserva. Essa ação é irreversível.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="flex flex-row gap-3">
                    <DialogClose asChild>
                      <Button
                        variant="secondary"
                        className="w-full border-2 border-[#daa520] rounded-lg"
                      >
                        Voltar
                      </Button>
                    </DialogClose>
                    <DialogClose asChild className="w-full">
                      <Button
                        variant="destructive"
                        onClick={handleCancelBooking}
                        className="w-full border-2 border-[#ea0304] text-white hover:border-[#ea0304] rounded-lg"
                      >
                        Confirmar
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
export default BookingItem;