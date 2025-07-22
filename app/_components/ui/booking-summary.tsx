// app/_components/ui/booking-summary.tsx

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Card, CardContent } from './card'
import { formatCurrency } from '@/app/_lib/utils'

// Definimos os tipos para as props do componente
interface Service {
  name: string
  price: string | number
}
interface Barbershop {
  name: string
}
interface BookingSummaryProps {
  service: Service
  barbershop: Barbershop
  selectedDate: Date
}

// A prop 'barbershop' agora é utilizada no JSX
const BookingSummary = ({
  service,
  barbershop,
  selectedDate,
}: BookingSummaryProps) => {
  return (
    <Card className="border-2 border-[#daa520] bg-card text-white">
      <CardContent className="space-y-3 p-3">
        {/* Serviço e Preço */}
        <div className="flex items-center justify-between font-bold">
          <h2 className="text-white">{service.name}</h2>
          <p className="text-[#FFD700]">{formatCurrency(service.price)}</p>
        </div>

        <div className="border-t border-solid border-zinc-700" />

        {/* Data */}
        <div className="flex items-center justify-between text-sm">
          <h2 className="text-gray-400">Data</h2>
          <p className="capitalize">
            {format(selectedDate, "d 'de' MMMM", {
              locale: ptBR,
            })}
          </p>
        </div>

        {/* Horário */}
        <div className="flex items-center justify-between text-sm">
          <h2 className="text-gray-400">Horário</h2>
          <p>{format(selectedDate, 'HH:mm')}</p>
        </div>

        {/* =================================================================== */}
        {/* CORREÇÃO APLICADA AQUI: usamos a prop 'barbershop'              */}
        {/* =================================================================== */}
        <div className="flex items-center justify-between text-sm">
          <h2 className="text-gray-400">Barbearia</h2>
          <p className="font-semibold">{barbershop.name}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default BookingSummary
