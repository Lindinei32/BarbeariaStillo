// app/_actions/create-booking.ts (Versão Completa e Melhorada)

"use server"; // Marca como Server Action

import { revalidatePath } from "next/cache"; // Para invalidar cache do Next.js
import { db } from "@/app/_lib/prisma"; // Seu Prisma Client (verifique o caminho)
import { getServerSession } from "next-auth"; // Para obter dados da sessão no servidor
import { authOptions } from "@/app/_lib/auth"; // Suas opções de autenticação (verifique o caminho)
import { Prisma } from "@prisma/client"; // Para usar tipos gerados pelo Prisma

// Interface para definir os parâmetros esperados pela função createBooking
// Removido userId daqui, pois pegaremos da sessão autenticada
interface CreateBookingParams {
  serviceId: string;
  date: Date;
  // Adicione outros campos se forem necessários para criar o booking,
  // por exemplo, barbershopId, se não estiver implícito pelo serviceId
  // barbershopId?: string;
}

/**
 * Cria um novo agendamento no banco de dados para o usuário autenticado.
 * Após a criação, invalida o cache das páginas relevantes (Home e Bookings).
 *
 * @param params - Objeto contendo serviceId e date para o novo agendamento.
 * @returns O objeto do agendamento recém-criado.
 * @throws {Error} Se o usuário não estiver autenticado ou se ocorrer um erro no banco de dados.
 */
export const createBooking = async (params: CreateBookingParams) => {
  // 1. Obter a sessão do usuário no servidor
  const session = await getServerSession(authOptions);

  // 2. Validar autenticação
  if (!session?.user?.id) {
     const errorMessage = "Usuário não autenticado. Não é possível criar agendamento.";
     console.error(`[Action createBooking] ${errorMessage}`);
    // Lança um erro que será capturado pelo 'catch' no componente cliente
    throw new Error("Você precisa estar logado para fazer um agendamento.");
  }

  // 3. Obter ID do usuário da sessão
  const userId = session.user.id as string;

  // 4. Validar Parâmetros (Exemplo básico - adicione mais validações se necessário)
  if (!params.serviceId || !params.date) {
      const errorMessage = "Parâmetros inválidos: serviceId e date são obrigatórios.";
      console.error(`[Action createBooking] ${errorMessage} para User ID: ${userId}`);
      throw new Error("Informações do serviço ou data inválidas.");
  }

  // TODO: Adicionar validação importante aqui:
  // Verificar se já existe um agendamento para este usuário/barbearia neste horário?
  // Ou se o horário está disponível (não conflita com outros agendamentos da barbearia)
  // Exemplo (simplificado):
  /*
  const existingBooking = await db.booking.findFirst({
      where: {
          date: params.date,
          // Provavelmente precisa do barbershopId aqui também
          // barbershopId: params.barbershopId, // Obter isso de alguma forma
      }
  });
  if (existingBooking) {
      throw new Error("Este horário já está reservado.");
  }
  */

  

  try {
    // 5. Criar o agendamento no banco de dados
    const newBooking = await db.booking.create({
      data: {
        serviceId: params.serviceId,
        date: params.date,
        userId: userId, // Garante que o userId da sessão seja usado
        // barbershopId: params.barbershopId, // Adicione se necessário
      },
      // Opcional: Incluir dados relacionados se precisar retornar mais info
      // include: { service: { include: { barbershop: true } } }
    });

    console.log(`[Action createBooking] Reserva ${newBooking.id} criada com sucesso para User ID: ${userId}.`);

    // --- 6. REVALIDAÇÃO de Cache ---
    // Invalida o cache de renderização estática ou de dados para as rotas especificadas.
    // Isso garante que na próxima visita ou no próximo polling, os dados sejam buscados novamente.
    revalidatePath("/"); // Revalida a página inicial
    console.log("[Action createBooking] Cache PATH revalidado: /");

    revalidatePath("/bookings"); // Revalida a página de agendamentos do usuário
    console.log("[Action createBooking] Cache PATH revalidado: /bookings");
    // -----------------------------

    // 7. Retorna o objeto do agendamento criado (pode ser útil no cliente)
    // IMPORTANTE: Se retornar, considere a questão do tipo Decimal/Date
    // Para evitar problemas, converta price/date para string/number aqui
    // ou use JSON.parse(JSON.stringify(newBooking)) se aceitar as consequências
    // Exemplo convertendo:
    /*
     if (newBooking.service?.price) { // Verifica se service foi incluído
         return {
             ...newBooking,
             service: {
                 ...newBooking.service,
                 price: Number(newBooking.service.price)
             }
         };
     }
    */
    // Retornando o objeto original por enquanto:
    return newBooking;


  } catch (error) {
      // Log detalhado do erro no servidor
      console.error(`[Action createBooking] ERRO DETALHADO ao criar reserva para User ID ${userId}:`, error);

      // Tratar erros específicos do Prisma, se necessário
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
          // Exemplo: Chave única violada (embora menos provável com IDs padrão)
          if (error.code === 'P2002') {
              throw new Error("Erro ao salvar agendamento (dados duplicados).");
          }
      }
      // Lança um erro genérico para o cliente
      throw new Error("Ocorreu um erro inesperado ao criar seu agendamento. Por favor, tente novamente.");
  }
};