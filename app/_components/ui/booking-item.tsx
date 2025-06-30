"use client"

import { Prisma } from "@prisma/client"

import { format, isFuture } from "date-fns"
import { ptBR } from "date-fns/locale"

import Image from "next/image"
import PhoneItem from "./phone-item"



import { toast } from "sonner"
import { useState } from "react"
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

interface BookingItemProps {
  booking: Prisma.BookingGetPayload<{
    include: {
      service: {
        include: {
          barbershop: true
        }
      }
    }
  }>
}

const BookingItem = ({ booking }: BookingItemProps) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const {
    service: { barbershop },
  } = booking
  const isConfirmed = isFuture(booking.date)
  const handleCancelBooking = async () => {
    try {
      await deleteBooking(booking.id)
      setIsSheetOpen(false)
      toast.success("Reserva cancelada com sucesso!")
    } catch (error) {
      console.error(error)
      toast.error("Erro ao cancelar reserva. Tente novamente.")
    }
  }
  const handleSheetOpenChange = (isOpen: boolean) => {
    setIsSheetOpen(isOpen)
  }
  return (
    <Sheet open={isSheetOpen} onOpenChange={handleSheetOpenChange}>
      <SheetTrigger className="bg [#121212] w-full min-w-[90%]">
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
              <p className="font-bold text-white text-lg">
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
  href="https://www.google.com/maps/dir//Av.+Benjamin+Possebon,+1041+-+Quissisana,+S%C3%A3o+Jos%C3%A9+dos+Pinhais+-+PR,+83085-190/@-25.5536943,-49.2381857,12z/data=!4m8!4m7!1m0!1m5!1m1!1s0x94dcf6e7ec437aef:0x2b5ad76286a82205!2m2!1d-49.1558238!2d-25.5537016?entry=ttu&g_ep=EgoyMDI1MDQyOS4wIKXMDSoASAFQAw%3D%3Dww.google.com/maps/dir/-25.5550844,-49.1562745/Av.+Benjamin+Possebon,+1041+-+Quissisana,+S%C3%A3o+Jos%C3%A9+dos+Pinhais+-+PR,+83085-190/@-25.5543799,-49.1587836,17z/data=!3m1!4b1!4m9!4m8!1m1!4e1!1m5!1m1!1s0x94dcf6e425ca3581:0xb33ef4672ba1f575!2m2!1d-49.1557865!2d-25.5536702?entry=ttu&https://www.google.com/maps/dir/-25.5550844,-49.1562745/Av.+Benjamin+Possebon,+1041+-+Quissisana,+S%C3%A3o+Jos%C3%A9+dos+Pinhais+-+PR,+83085-190/@-25.5543799,-49.1587836,17z/data=!3m1!4b1!4m9!4m8!1m1!4e1!1m5!1m1!1s0x94dcf6e425ca3581:0xb33ef4672ba1f575!2m2!1d-49.1557865!2d-25.5536702?entry=ttu&g_ep=EgoyMDI1MDQyOS4wIKXMDSoASAFQAw%3D%3Dg_ep=EgoyMDI1MDQyOS4wIKXMDSoASAFQAw%3D%3Dps://www.https://www.google.com/maps/place/Av.+Benjamin+Possebon,+1041+-+Quissisana,+S%C3%A3o+Jos%C3%A9+dos+Pinhais+-+PR,+83085-190/@-25.5536702,-49.1557865,17z/data=!4m6!3m5!1s0x94dcf6e425ca3581:0xb33ef4672ba1f575!8m2!3d-25.5536702!4d-49.1557865!16s%2Fg%2F11c279lp9t?entry=ttu&g_ep=EgoyMDI1MDQyOC4wIKXMDSoASAFQAw%3D%3Dgoogle.com/maps/dir/-25.5550844,-49.1562745/Av.+Benjamin+Possebon,+1041+-+Quissisana,+S%C3%A3o+Jos%C3%A9+dos+Pinhais+-+PR,+83085-190/@-25.5543799,-49.1587836,17z/data=!3m1!4b1!4m9!4m8!1m1!4e1!1m5!1m1!1s0x94dcf6e425ca3581:0xb33ef4672ba1f575!2m2!1d-49.1557865!2d-25.5536702?entry=ttu&g_ep=EgoyMDI1MDQyOC4wIKXMDSoASAFQAw%3D%3D"
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
            <Dialog>
              <DialogTrigger className="w-full">
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
                  <DialogTitle>Você deseja cancelar sua reserva?</DialogTitle>
                  <DialogDescription>
                    Ao cancelar, você perderá sua reserva e não poderá recuperá-la. Essa ação é irreversível.
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
                  <DialogClose className="w-full">
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
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
export default BookingItem