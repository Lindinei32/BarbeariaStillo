// app/adm/page.tsx

"use client";

import { useEffect, useState, useCallback, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Importando o hook de autenticação do local correto
import { useAuth } from "@/app/_context/AuthContext";

// Importando os componentes de UI
import Header from "../_components/ui/header";
import BookingCardAdmin from "../_components/ui/bookingCardAdmin";
import AdminHoursForm from "../_components/ui/admin-hours-form";

// Importando as Server Actions e os tipos necessários
import { getAllAdminBookings, type BookingAdminListData } from "../_actions/get-all-admin-bookings";
import { getBarbershopData } from "../_actions/get-barbershop-data";
import { updateBarbershopHours } from "../_actions/update-barbershop-hours";
import { clearBarbershopHours } from "../_actions/clear-barbershop-hours";

// A interface que descreve os dados da barbearia para esta página
interface BarbershopData {
  id: string; name: string; address: string; phones: string; description: string; imageUrl: string;
  openingTime: string | null; closingTime: string | null; createdAt: Date; updatedAt: Date;
}

export default function AdmPage() {
  const [bookings, setBookings] = useState<BookingAdminListData[]>([]);
  const [barbershop, setBarbershop] = useState<BarbershopData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const fetchAdminBookings = useCallback(async () => {
    try {
      const data = await getAllAdminBookings();
      setBookings(data);
    } catch (error) {
      console.error("Erro ao buscar agendamentos de admin:", error);
      toast.error("Falha ao atualizar a lista de agendamentos.");
    }
  }, []);

  const fetchPageData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [barbershopData] = await Promise.all([
        getBarbershopData(),
        fetchAdminBookings(),
      ]);
      setBarbershop(barbershopData);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao carregar dados do painel.");
      router.replace('/');
    } finally {
      setIsLoading(false);
    }
  }, [router, fetchAdminBookings]);

  const handleClearClick = useCallback(async () => {
    if (isSubmitting || !barbershop) return;
    if (!confirm("Tem certeza que deseja limpar os horários?")) return;

    setIsSubmitting(true);
    const toastId = toast.loading("Limpando horários...");
    try {
      await clearBarbershopHours(barbershop.id);
      const data = await getBarbershopData();
      setBarbershop(data);
      toast.success("Horários limpos com sucesso!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao limpar os horários.");
    } finally {
      setIsSubmitting(false);
      toast.dismiss(toastId);
    }
  }, [barbershop, isSubmitting]);

  const handleSaveSubmit = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting || !barbershop) return;

    setIsSubmitting(true);
    const toastId = toast.loading("Salvando horários...");
    const formData = new FormData(event.currentTarget);

    const params = {
      barbershopId: barbershop.id,
      openingTime: formData.get('openingTime') as string,
      closingTime: formData.get('closingTime') as string,
    };

    try {
      await updateBarbershopHours(params);
      const data = await getBarbershopData();
      setBarbershop(data);
      toast.success("Horários salvos com sucesso!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao salvar os horários.");
    } finally {
      setIsSubmitting(false);
      toast.dismiss(toastId);
    }
  }, [barbershop, isSubmitting]);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user || !user.isAdmin) {
      toast.error("Acesso negado.");
      router.replace('/');
      return;
    }
    fetchPageData();
  }, [user, isAuthLoading, router, fetchPageData]);
  
  // useEffect para implementar o Polling
  useEffect(() => {
    if (user?.isAdmin && !isLoading) {
      // ===================================================================
      // A ÚNICA MUDANÇA ESTÁ AQUI: ALTERAMOS O INTERVALO
      // ===================================================================
      const intervalId = setInterval(() => {
        console.log("[Admin Polling] Buscando novos agendamentos...");
        fetchAdminBookings();
      }, 5000); // <-- Alterado de 15000 (15s) para 5000 (5s)

      return () => clearInterval(intervalId);
    }
  }, [user, isLoading, fetchAdminBookings]);


  if (isAuthLoading || isLoading) {
    return (
      <div>
        <Header />
        <div className="p-5 text-center">Carregando painel de administração...</div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="p-5">
        <div className="mb-6 text-center text-xl font-extrabold text-white">
          Olá, {user?.name || 'administrador'}!
        </div>

        {barbershop && (
          <div className="container mx-auto mb-8 max-w-lg">
            <h2 className="mb-4 text-center text-lg font-bold italic">
              Gerenciar Horário de Funcionamento
            </h2>
            <AdminHoursForm
              barbershop={barbershop}
              onSaveSubmit={handleSaveSubmit}
              onClearClick={handleClearClick}
            />
          </div>
        )}

        <div className="container mx-auto max-w-lg">
          <h2 className="mb-4 text-center text-lg font-bold italic">
            Horários Agendados
          </h2>
          {bookings.length > 0 ? (
            <div className="flex flex-col gap-4">
              {bookings.map((booking) => (
                <BookingCardAdmin
                  key={booking.id}
                  booking={booking}
                  onBookingDeleted={fetchPageData}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400">
              Nenhum agendamento encontrado.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}