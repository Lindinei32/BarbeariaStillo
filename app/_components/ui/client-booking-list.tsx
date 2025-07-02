"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
// 1. Importa a função E o TIPO CORRETO do arquivo de dados
import { getConfirmadBookings, ConfirmedBookingClientSafe } from "@/app/_data/get-confirmad-bookings"; // Ajuste o caminho se necessário
import BookingItem from "./booking-item";

export default function ClientBookingList() {
  // 2. Usa o TIPO CORRETO para o estado
  const [confirmedBookings, setConfirmedBookings] = useState<ConfirmedBookingClientSafe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 3. Remove 'session' da desestruturação, usa '_' se precisar manter a ordem, ou omite se for o último
  // const { data: session, status } = useSession(); // Original
  const { status } = useSession(); // Apenas 'status' é necessário

  // Função para buscar os dados (useCallback para otimização)
  const fetchConfirmedBookings = useCallback(async (isInitialLoad = false) => {
    // Só busca se autenticado
    if (status !== 'authenticated') {
      setConfirmedBookings([]); // Limpa bookings se deslogar
      if (isInitialLoad) setIsLoading(false); // Para loading se não estiver logado na carga inicial
      return;
    }

    // Limpa erro apenas se for carga inicial para não esconder erro de polling
    if (isInitialLoad) setError(null);

    try {
      console.log(`[ClientBookingList] Fetching confirmed bookings... (Initial: ${isInitialLoad})`);
      const bookingsResult = await getConfirmadBookings(); // Chama a função importada
      setConfirmedBookings(bookingsResult);
      // Limpa erro se o polling tiver sucesso após um erro anterior
      if (!isInitialLoad) setError(null);
      console.log(`[ClientBookingList] Found ${bookingsResult.length} confirmed bookings.`);
    } catch (err) {
      console.error("[ClientBookingList] Error fetching bookings:", err);
      setError(err instanceof Error ? err.message : "Erro ao buscar agendamentos.");
    } finally {
      // Desativa o loading inicial apenas uma vez
      if (isInitialLoad) setIsLoading(false);
    }
  }, [status]); // Depende apenas do status

  // Efeito para carga inicial
  useEffect(() => {
    // Se o status ainda não foi determinado, espera
    if (status === 'loading') return;

    // Se já sabemos o status e ainda estamos no loading inicial, busca
    if (isLoading) {
        fetchConfirmedBookings(true);
    }
    // Se o status mudou para não autenticado DEPOIS da carga inicial, limpa os dados
    else if (status === 'unauthenticated') {
        setConfirmedBookings([]);
    }

  }, [status, isLoading, fetchConfirmedBookings]);

  // Efeito para polling e atualização instantânea
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    // Inicia polling somente se autenticado E a carga inicial terminou
    if (status === 'authenticated' && !isLoading) {
      console.log("[ClientBookingList] Starting polling every 30s.");
      intervalId = setInterval(() => {
        fetchConfirmedBookings(false); // Busca periódica
      }, 30000); // 30 segundos

      // Escuta evento global para atualização instantânea
      const handleBookingCreated = () => {
        fetchConfirmedBookings(false);
      };
      window.addEventListener("booking:created", handleBookingCreated);

      // Limpeza
      return () => {
        if (intervalId) {
          clearInterval(intervalId);
          console.log("[ClientBookingList] Polling stopped.");
        }
        window.removeEventListener("booking:created", handleBookingCreated);
      };
    }
    // Função de limpeza que para o intervalo
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
        console.log("[ClientBookingList] Polling stopped.");
      }
    };
  }, [status, isLoading, fetchConfirmedBookings]); // Dependências corretas

  // --- RENDERIZAÇÃO ---

  // Não renderiza nada se não estiver autenticado (a página pai pode lidar com isso)
  // Ou pode adicionar uma mensagem "Faça login para ver seus agendamentos"
  if (status !== 'authenticated') {
     // Poderia retornar <p>Faça login...</p> ou null para não mostrar nada
    return null;
  }

  // Renderiza estado de carregamento inicial
  if (isLoading) {
    return (
      <div className="mt-6">
        <h2 className="mb-3 text-sm uppercase font-bold text-white">Seus Agendamentos</h2>
        <p className="text-sm text-gray-400">Carregando...</p>
      </div>
    );
  }

  // Renderiza estado de erro
  if (error) {
    return (
      <div className="mt-6">
        <h2 className="mb-3 text-sm uppercase text-gray-400 font-bold">Seus Agendamentos</h2>
        <p className="text-sm text-red-500">Erro ao carregar: {error}</p>
      </div>
    );
  }

  // Renderiza a lista se houver agendamentos
  if (confirmedBookings.length > 0) {
    return (
      <div className="mt-6">
        <h2 className="mb-3 text-sm uppercase font-bold">Seus Agendamentos</h2>
        <div className="flex gap-5 overflow-x-auto [&::-webkit-scrollbar]:hidden pb-2"> {/* Adicionado pb-2 */}
          {confirmedBookings.map((booking) => (
            // Passa o booking diretamente do estado (já no formato correto para cliente)
            <BookingItem key={booking.id} booking={booking} />
          ))}
        </div>
      </div>
    );
  }

  // Se autenticado, sem loading, sem erro, mas sem bookings, pode retornar null
  // ou uma mensagem "Nenhum agendamento confirmado encontrado."
  return null; // Não mostra a seção se não houver bookings confirmados
}