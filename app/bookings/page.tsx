"use client"; // 1. ESSENCIAL: Marca como Client Component

import { useEffect, useState, useCallback } from "react"; // Hooks do React
import { useSession } from "next-auth/react"; // Hook da sessão no cliente
import { useRouter } from "next/navigation"; // Hook de roteamento no cliente

import Header from "../_components/ui/header"; // Componente Header
import BookingItem from "../_components/ui/booking-item"; // Componente para exibir reserva

// --- CORREÇÃO NOS IMPORTS ---
import { getConfirmadBookings, ConfirmedBookingClientSafe } from "../_data/get-confirmad-bookings"; // Corrigido: from, tipo correto
import { getConcludeBookings, ConcludedBookingClientSafe } from "../_data/get-conclud-bookings"; // Corrigido: from, tipo correto
// --- FIM CORREÇÃO IMPORTS ---


// A função do componente NÃO é mais async diretamente
export default function BookingsPage() {
  // --- CORREÇÃO NOS TIPOS DO ESTADO ---
  const [confirmedBookings, setConfirmedBookings] = useState<ConfirmedBookingClientSafe[]>([]);
  const [concludedBookings, setConcludedBookings] = useState<ConcludedBookingClientSafe[]>([]);
  // --- FIM CORREÇÃO TIPOS ESTADO ---

  const [isLoading, setIsLoading] = useState(true); // Controla o loading inicial
  const [error, setError] = useState<string | null>(null); // Armazena mensagens de erro

  // --- CORREÇÃO: Variável 'session' removida da desestruturação ---
  // Obtenha APENAS o status da sessão, já que 'data' (renomeado para 'session') não é usado
  const { status } = useSession(); // Obtém APENAS o status da sessão
  // --- FIM CORREÇÃO ---
  const router = useRouter(); // Obtém o objeto router

  // Função para buscar os dados (envolvida em useCallback para otimização)
  const fetchBookings = useCallback(async (isInitialLoad = false) => {
    // Só busca se o usuário estiver autenticado
    if (status !== "authenticated") {
        console.log("[BookingsPage] Tentativa de fetch sem autenticação.");
        return;
    }

    if (!isInitialLoad) console.log("[BookingsPage] Polling: Buscando agendamentos...");
    else console.log("[BookingsPage] Carga inicial: Buscando agendamentos...");

    setError(null); // Limpa erros anteriores

    try {
      // Chama as funções importadas corretamente
      const [confirmed, concluded] = await Promise.all([
        getConfirmadBookings(), // Chama a função importada
        getConcludeBookings()   // Chama a função importada
      ]);

      // Atualiza os estados com os dados recebidos
      setConfirmedBookings(confirmed);
      setConcludedBookings(concluded);
      console.log(`[BookingsPage] Agendamentos atualizados: ${confirmed.length} confirmados, ${concluded.length} concluídos.`);
    } catch (err) {
      // Lida com erros durante a busca
      console.error("[BookingsPage] Erro ao buscar agendamentos:", err);
      setError(err instanceof Error ? err.message : "Erro desconhecido ao buscar dados.");
    } finally {
      // Desativa o loading SÓ na primeira carga para evitar piscar a tela no polling
      if (isInitialLoad) {
          console.log("[BookingsPage] Carga inicial concluída.");
          setIsLoading(false);
      }
    }
  }, [status]); // Depende do 'status' para reavaliar se deve buscar

  // Efeito para verificar autenticação e fazer a carga inicial dos dados
  useEffect(() => {
    console.log("[BookingsPage Effect - Auth/Load] Status atual:", status);
    if (status === "loading") {
        console.log("[BookingsPage Effect - Auth/Load] Aguardando status da sessão...");
        return; // Aguarda a definição do status
    }
    if (status === "unauthenticated") {
      console.log("[BookingsPage Effect - Auth/Load] Não autenticado. Redirecionando para /");
      router.replace("/"); // Redireciona se não estiver logado
    } else if (status === "authenticated" && isLoading) {
      // Se autenticado E ainda no estado de loading inicial, busca os dados
      console.log("[BookingsPage Effect - Auth/Load] Autenticado e carregando. Iniciando busca inicial...");
      fetchBookings(true);
    }
  }, [status, router, fetchBookings, isLoading]); // Dependências corretas

  // Efeito para configurar e limpar o POLLING (busca periódica)
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    // Começa o polling APENAS se autenticado e APÓS a carga inicial ter terminado
    if (status === "authenticated" && !isLoading) {
      console.log("[BookingsPage Effect - Polling] Iniciando polling a cada 30s...");
      intervalId = setInterval(() => {
        console.log("[BookingsPage Effect - Polling] Intervalo disparado.");
        fetchBookings(false); // Busca periódica (não é carga inicial)
      }, 30000); // Intervalo de 30 segundos (30000 ms)
    }

    // Função de limpeza: será chamada quando o componente desmontar ou as dependências mudarem
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
        console.log("[BookingsPage Effect - Polling] Polling interrompido.");
      }
    };
  }, [status, isLoading, fetchBookings]); // Dependências corretas para o polling

  // --- RENDERIZAÇÃO ---

  // Renderiza estado de carregamento inicial ou enquanto verifica acesso
  if (status === "loading" || (status === "authenticated" && isLoading)) {
    return (
      <div>
        <Header />
        <div className="p-5 text-center">Carregando seus agendamentos...</div>
      </div>
    );
  }

  // Renderiza enquanto redireciona (se não autenticado)
  if (status !== "authenticated") {
    return (
      <div>
        <Header />
        <div className="p-5 text-center">Verificando acesso...</div>
      </div>
    );
  }

  // Renderização principal com os dados do ESTADO
  return (
    <>
      <Header />
      <div className="space-y-3 p-5"> {/* Ajustado padding e espaçamento */}
        <h1 className="text-2xl font-bold mb-6">Meus Agendamentos</h1> {/* Adicionado mb-6 */}

        {/* Exibe erro, se houver */}
        {error && (
          <div className="my-4 rounded border border-red-400 bg-red-100 p-3 text-center text-red-600"> {/* Ajustado cores erro */}
            <strong>Falha ao carregar:</strong> {error}
          </div>
        )}

        {/* Mensagem se não houver agendamentos E nenhum erro */}
        {!isLoading && confirmedBookings.length === 0 && concludedBookings.length === 0 && !error && (
          <p className="text-center text-muted-foreground mt-5"> {/* Estilo para msg vazia */}
            Você ainda não possui agendamentos.
          </p>
        )}

        {/* Agendamentos confirmados */}
        {confirmedBookings.length > 0 && (
          <div className="mt-6"> {/* Adicionado div wrapper */}
            <h2 className="mb-3 text-sm uppercase text-gray-400 font-bold">Confirmados</h2> {/* Ajustado estilo título seção */}
             <div className="flex flex-col gap-3"> {/* Layout coluna e gap */}
                {confirmedBookings.map((booking) => (
                <BookingItem key={booking.id} booking={booking} />
                ))}
             </div>
          </div>
        )}

        {/* Agendamentos finalizados */}
        {concludedBookings.length > 0 && (
          <div className="mt-6"> {/* Adicionado div wrapper */}
            <h2 className="mb-3 text-sm uppercase text-gray-400 font-bold">Finalizados</h2> {/* Ajustado estilo título seção */}
             <div className="flex flex-col gap-3"> {/* Layout coluna e gap */}
                {concludedBookings.map((booking) => (
                <BookingItem key={booking.id} booking={booking} />
                ))}
             </div>
          </div>
        )}
      </div>
    </>
  );
}