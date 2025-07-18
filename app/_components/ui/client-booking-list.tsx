// app/_components/ui/client-booking-list.tsx

"use client";

import { useState, useEffect, useCallback } from "react";

// IMPORT REMOVIDO
// import { useSession } from "next-auth/react"; // <-- REMOVIDO!

// IMPORT DA NOSSA SERVER ACTION (o nome pode ser mantido, mas a implementação interna dela mudará)


// IMPORT DO NOSSO COMPONENTE
import BookingItem from "./booking-item";
import { getConfirmadBookings } from "@/app/_data/get-confirmad-bookings";

// ===================================================================
// AÇÃO 1: CRIAR NOSSOS PRÓPRIOS TIPOS PARA SUBSTITUIR OS DO PRISMA
// ===================================================================
// Reutilizamos os mesmos tipos que definimos no componente BookingItem para consistência.
interface Barbershop {
  id: string;
  name: string;
  address: string;
  imageUrl: string;
  phones: string;
}

interface Service {
  id: string;
  name: string;
  price: string;
  barbershop: Barbershop;
}

interface Booking {
  id: string;
  date: Date;
  service: Service;
}


export default function ClientBookingList() {
  // O estado agora usa o nosso tipo 'Booking'
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ===================================================================
  // AÇÃO 2: SIMPLIFICAR A FUNÇÃO DE BUSCA
  // ===================================================================
  // A função não precisa mais se preocupar com o 'status' da sessão.
  // Ela apenas tenta buscar os dados. O servidor é quem vai validar o usuário.
  const fetchBookings = useCallback(async () => {
    try {
      // A Server Action `getConfirmadBookings` agora vai ler o cookie JWT no servidor
      // para descobrir quem é o usuário e buscar os agendamentos dele.
      const fetchedBookings = await getConfirmadBookings();
      setBookings(fetchedBookings);
    } catch (err) {
      console.error("[ClientBookingList] Error fetching bookings:", err);
      // Se a Server Action der um erro (ex: usuário não logado), o catch vai pegar.
      setError(err instanceof Error ? err.message : "Erro ao buscar agendamentos.");
      setBookings([]); // Limpa os agendamentos em caso de erro
    } finally {
      setIsLoading(false); // Desativa o loading após a primeira tentativa
    }
  }, []); // useCallback agora não tem dependências externas

  // ===================================================================
  // AÇÃO 3: SIMPLIFICAR OS EFEITOS (useEffect)
  // ===================================================================
  // Efeito para a carga inicial
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Efeito para atualização instantânea (o polling foi removido para simplificar,
  // mas pode ser adicionado de volta se necessário)
  useEffect(() => {
    const handleBookingCreated = () => {
      fetchBookings();
    };

    window.addEventListener("booking:created", handleBookingCreated);

    return () => {
      window.removeEventListener("booking:created", handleBookingCreated);
    };
  }, [fetchBookings]);

  // --- RENDERIZAÇÃO ---

  // A lógica de renderização agora é mais direta
  if (isLoading) {
    return (
      <div className="mt-6">
        <h2 className="mb-3 text-sm uppercase font-bold text-white">Seus Agendamentos</h2>
        <p className="text-sm text-gray-400">Carregando...</p>
      </div>
    );
  }

  // Se houver erro, podemos optar por não mostrar nada ou exibir uma mensagem
  if (error) {
    // Você pode mostrar a mensagem de erro ou simplesmente retornar null
    // para não poluir a UI se o usuário não estiver logado.
    // console.log("Não renderizando a lista de agendamentos devido a erro:", error);
    return null; 
  }

  // Não mostra a seção se não houver agendamentos
  if (bookings.length === 0) {
    return null;
  }

  // Renderiza a lista se tudo estiver OK
  return (
    <div className="mt-6">
      <h2 className="mb-3 text-sm uppercase font-bold text-white">Seus Agendamentos</h2>
      <div className="flex gap-5 overflow-x-auto [&::-webkit-scrollbar]:hidden pb-2">
        {bookings.map((booking) => (
          <BookingItem key={booking.id} booking={booking} />
        ))}
      </div>
    </div>
  );
}