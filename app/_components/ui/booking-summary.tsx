import { format } from "date-fns"

import { Barbershop, BarbershopService } from "@prisma/client"
import { ptBR } from "date-fns/locale"
import { Card, CardContent } from "./card"

interface BookingSummaryProps {
  service: Pick<BarbershopService, "name" | "price">
  barbershop: Pick<Barbershop, "name">
  selectedDate: Date
}

const BookingSummary = ({ service, selectedDate }: BookingSummaryProps) => {
  return (
    <Card className="border-2 border-[#daa520]">
      <CardContent className="space-y-3 p-3">
        <div className="flex items-center justify-between font-bold text-[#FFD700]">
          <h2>{service.name}</h2>
          <p>
            {Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(Number(service?.price ?? 0))}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <h2>Data</h2>
          <p>
            {format(selectedDate, "d 'de' MMMM", {
              locale: ptBR,
            })}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <h2>Horário</h2>
          <p className="text-sm">{format(selectedDate, "HH:mm")}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default BookingSummary
