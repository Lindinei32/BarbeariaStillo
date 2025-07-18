"use client"
import React, { useState } from "react"
import { Prisma } from "@prisma/client"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/_components/ui/avatar" // Verifique o caminho
import { Card, CardContent } from "@/app/_components/ui/card" // Verifique o caminho
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/_components/ui/dialog" // Verifique o caminho
import { toast } from "sonner"
import { deleteBooking } from "@/app/_actions/delete-booking" // Verifique o caminho
// import { useRouter } from "next/navigation"; // Router não é mais necessário aqui
import { Button } from "@/app/_components/ui/button" // Verifique o caminho

// Tipo esperando o usuário completo
type BookingWithIncludes = Prisma.BookingGetPayload<{
  include: {
    user: true
    service: {
      include: {
        barbershop: true
      }
    }
  }
}>

// Interface de Props com a função de callback (CORRIGIDA)
interface BookingCardAdminProps {
  booking: BookingWithIncludes
  // O nome do parâmetro na definição do tipo foi prefixado com _
  onBookingDeleted: (_bookingId: string) => void; // Callback para notificar a página pai
}

export default function BookingCardAdmin({ booking, onBookingDeleted }: BookingCardAdminProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false); // Estado para feedback de exclusão

  // Função de cancelamento atualizada
  const handleCancelBooking = async () => {
     if (!booking.id) {
       console.error("[BookingCardAdmin] Booking ID inválido.");
       toast.error("Não foi possível cancelar: ID da reserva inválido.");
       return;
     }
    setIsDeleting(true); // Inicia o estado de "deletando"
    try {
      // A CHAMADA DA FUNÇÃO CONTINUA IGUAL, passando o valor booking.id
      await deleteBooking(booking.id); // Chama a action do servidor
      setIsDialogOpen(false); // Fecha o dialog
      toast.success("Reserva cancelada com sucesso!");

      // Chama a função da página pai para atualizar a UI localmente
      // A CHAMADA DA FUNÇÃO CONTINUA IGUAL, passando o valor booking.id
      onBookingDeleted(booking.id);

    } catch (error) {
      console.error("[BookingCardAdmin] Erro ao cancelar reserva:", error);
      // Mostra erro específico da action, se disponível
      if (error instanceof Error) {
         toast.error(`Erro ao cancelar: ${error.message}`);
      } else {
         toast.error("Erro ao cancelar reserva. Tente novamente.");
      }
    } finally {
        setIsDeleting(false); // Finaliza o estado de "deletando"
    }
  };

  // Extração de dados do usuário (OK)
  const userImage = booking.user?.image ?? undefined;
  const userName = booking.user?.name ?? "Cliente";
  const userFallback = userName?.charAt(0).toUpperCase() ?? "C";

  // Formatação de data/hora (OK)
  const formattedTime = format(booking.date, "HH:mm");
  const formattedDateShort = format(booking.date, "dd MMM", { locale: ptBR }).replace(/\b\w/g, (l) => l.toUpperCase());
  const formattedFullDate = format(booking.date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });

  return (
    <>
      {/* Overlay de Loading (opcional, mas bom para UX) */}
      {isDeleting && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
           {/* Ícone de Spinner Simples */}
           <svg className="h-10 w-10 animate-spin text-[#daa520]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
           </svg>
         </div>
      )}

      {/* Card Principal */}
      <Card className="border-2 border-[#daa520] bg-transparent">
        <CardContent className="flex flex-row items-center justify-between gap-2 p-3 sm:gap-4 sm:p-4">
          {/* Seção Esquerda: Avatar e Nomes */}
          <div className="flex min-w-0 items-center gap-2 overflow-hidden sm:gap-3">
            <Avatar className="h-10 w-10 flex-shrink-0 rounded-full border-2 border-[#daa520] bg-black sm:h-12 sm:w-12">
              <AvatarImage src={userImage} alt={`Avatar de ${userName}`} />
              <AvatarFallback>{userFallback}</AvatarFallback>
            </Avatar>
            <div className="min-w-0"> {/* Ajuda a controlar overflow de texto */}
              <p className="truncate text-sm font-semibold text-white sm:text-base">
                {userName}
              </p>
              <p className="truncate text-xs font-semibold text-white sm:text-sm">
                {booking.service?.name ?? "Serviço"}
              </p>
            </div>
          </div>

          {/* Seção Central: Hora e Data */}
          <div className="flex flex-shrink-0 flex-col items-center px-1 text-center sm:px-2">
            <p className="text-sm font-bold text-white sm:text-lg">
              {formattedTime}
            </p>
            <p className="text-xs font-semibold text-white sm:text-sm">
              {formattedDateShort}
            </p>
          </div>

          {/* Seção Direita: Botão Excluir e Dialog */}
          <div className="flex flex-shrink-0 items-center">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  className="border-2 border-[#FF143C] px-2 font-bold sm:px-3"
                  disabled={isDeleting} // Desabilita gatilho se já estiver deletando
                >
                  Excluir
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[90%] max-w-md border-[#FF143C] bg-black text-white">
                <DialogHeader>
                  <DialogTitle className="text-white">Cancelar Reserva?</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Esta ação não pode ser desfeita. A reserva para{" "}
                    <span className="font-medium text-[#daa520]">{booking.service?.name}</span>{" "}
                    em{" "}
                    <span className="font-medium text-[#daa520]">{formattedFullDate}</span>{" "}
                    será permanentemente excluída.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  {/* Botão Voltar */}
                  <DialogClose asChild>
                    <Button
                      type="button"
                      variant="secondary"
                      className="w-full border-2 border-[#daa520] bg-[#daa520] font-bold text-black hover:bg-[#c8941c] hover:text-black sm:w-auto"
                      disabled={isDeleting} // Desabilita durante a exclusão
                    >
                      Voltar
                    </Button>
                  </DialogClose>
                  {/* Botão Confirmar Exclusão */}
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleCancelBooking}
                    className="w-full border-2 border-[#ea0304] bg-[#ea0304] font-bold text-white hover:border-red-700 hover:bg-red-700 sm:w-auto"
                    disabled={isDeleting} // Desabilita durante a exclusão
                  >
                    {/* Texto dinâmico baseado no estado 'isDeleting' */}
                    {isDeleting ? "Excluindo..." : "Confirmar Exclusão"}
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