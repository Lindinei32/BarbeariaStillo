"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { BookingWithIncludes } from "../_components/ui/bookingCardAdmin"; // Verifique o caminho
import Header from "../_components/ui/header"; // Verifique o caminho
import BookingCardAdmin from "../_components/ui/bookingCardAdmin"; // Verifique o caminho
import { getAllAdminBookings } from "../_actions/get-all-admin-bookings"; // Verifique o caminho

export default function AdmPage() {
  const [bookings, setBookings] = useState<BookingWithIncludes[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { data: session, status } = useSession();
  const router = useRouter();

  const fetchAndUpdateBookings = useCallback(async (isInitialLoad = false) => {
    if (!isInitialLoad) {
      console.log("ADM Page (Client): Polling - buscando agendamentos...");
    } else {
        console.log("ADM Page (Client): Buscando agendamentos iniciais...");
    }
    try {
      const allBookings = await getAllAdminBookings();
      setBookings(allBookings as unknown as BookingWithIncludes[]); // Confie no tipo se a action retorna corretamente
      setError(null);
    } catch (err) {
      console.error("ADM Page (Client): Erro ao buscar agendamentos:", err);
      setError(err instanceof Error ? err.message : "Erro ao buscar agendamentos.");
    } finally {
      // Só muda isLoading na carga inicial
      if (isInitialLoad && isLoading) {
        setIsLoading(false);
      }
    }
  }, [isLoading]); // Removido setBookings, setError das dependências pois são estáveis

  useEffect(() => {
    if (status === "loading") {
      return;
    }

    if (status === "unauthenticated") {
      console.log("ADM Page (Client): Acesso negado, redirecionando...");
      router.replace("/");
    } else if (status === "authenticated") {
      console.log("ADM Page (Client): Acesso confirmado.");
      // Busca inicial dos dados
      fetchAndUpdateBookings(true);
    }
  }, [status, router, fetchAndUpdateBookings]); // Adicionado fetchAndUpdateBookings aqui

  useEffect(() => {
    // Configura o polling apenas se autenticado e após a carga inicial
    if (status === "authenticated" && !isLoading) {
      console.log("ADM Page (Client): Iniciando polling...");
      const intervalId = setInterval(() => fetchAndUpdateBookings(false), 15000); // 30 segundos

      // Função de limpeza para parar o polling quando o componente desmontar
      return () => {
        clearInterval(intervalId);
        console.log("ADM Page (Client): Polling parado.");
      };
    }
     // Dependências: status, isLoading e a função de fetch
  }, [status, isLoading, fetchAndUpdateBookings]);

  // --- NOVA FUNÇÃO ---
  // Função para remover um agendamento do estado local
  const handleBookingDeleted = useCallback((deletedBookingId: string) => {
    console.log(`ADM Page (Client): Removendo booking ${deletedBookingId} do estado local.`);
    setBookings((currentBookings) =>
      currentBookings.filter((booking) => booking.id !== deletedBookingId)
    );
    // Opcional: disparar uma busca imediata para revalidar com o servidor,
    // embora o polling vá fazer isso eventualmente.
    // fetchAndUpdateBookings(false);
  }, []); // Sem dependências, pois `setBookings` é estável

  // --- Estados de Carregamento e Autenticação (sem alterações) ---
  if (status === "loading" || (status === "authenticated" && isLoading)) {
    return (
      <div>
        <Header />
        <div className="px-4 py-6 text-center text-gray-400 sm:px-5">
          Carregando agendamentos...
        </div>
      </div>
    );
  }

  if (status !== "authenticated") {
    // Pode mostrar "Redirecionando..." ou null enquanto o useEffect redireciona
    return (
      <div>
        <Header />
        <div className="px-4 py-6 text-center text-gray-400 sm:px-5">
          Redirecionando...
        </div>
      </div>
    );
  }

  // --- Renderização da Página (passando a nova prop) ---
  return (
    <div>
      <Header />

      <div className="px-4 py-6 sm:px-5">
        <div className="text-center text-xl font-extrabold text-white">
          Olá, {session?.user?.name || "administrador"}!
        </div>
        <h2 className="mt-2 text-center text-lg font-bold italic">
          Horários Agendados
        </h2>
      </div>

      {error && (
        <div className="container mx-auto my-4 rounded border border-red-400 bg-red-100 p-3 px-4 text-red-700 sm:px-5">
          <p>
            <strong>Erro ao buscar agendamentos:</strong> {error}
          </p>
          <p className="text-sm">Tentando novamente em breve...</p>
        </div>
      )}

      <div className="container mx-auto px-4 pb-6 sm:px-5">
        {bookings.length === 0 && !error ? (
          <p className="mt-6 text-center text-gray-400">
            Nenhum agendamento encontrado.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {bookings.map((booking) => (
              <BookingCardAdmin
                key={booking.id}
                booking={booking}
                // --- NOVO: Passa a função de callback ---
                onBookingDeleted={handleBookingDeleted}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
