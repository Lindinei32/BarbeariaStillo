// app/_components/ui/booking-summary.tsx

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// IMPORT REMOVIDO
// import { Barbershop, BarbershopService } from "@prisma/client"; // <-- REMOVIDO!

// IMPORT DO COMPONENTE
import { Card, CardContent } from "./card";

// IMPORT DO NOSSO UTILITÁRIO DE FORMATAÇÃO (BOA PRÁTICA!)
import { formatCurrency } from "@/app/_lib/utils";

// ===================================================================
// AÇÃO 1: CRIAR NOSSOS PRÓPRIOS TIPOS PARA SUBSTITUIR OS DO PRISMA
// ===================================================================

// Definimos a "forma" de um serviço para este componente
interface Service {
  name: string;
  price: string | number; // Aceita string (do PG) ou número
}

// Definimos a "forma" de uma barbearia para este componente
interface Barbershop {
  name: string;
}

// O tipo das props agora usa as nossas interfaces
interface BookingSummaryProps {
  service: Service;
  barbershop: Barbershop;
  selectedDate: Date;
}

const BookingSummary = ({ service, barbershop, selectedDate }: BookingSummaryProps) => {
  return (
    <Card className="border-2 border-[#daa520]">
      <CardContent className="space-y-3 p-3">
        <div className="flex items-center justify-between font-bold text-[#FFD700]">
          <h2>{service.name}</h2>
          
          {/* =================================================================== */}
          {/* AÇÃO 2: USAR A FUNÇÃO DE UTILIDADE `formatCurrency`                 */}
          {/* =================================================================== */}
          {/* Isso centraliza a lógica de formatação e deixa o componente mais limpo */}
          <p>{formatCurrency(service.price)}</p>

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
  );
};

export default BookingSummary;