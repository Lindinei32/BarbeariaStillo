// app/_lib/utils.ts

// Imports para a função 'cn' que você já tinha
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Sua função existente para mesclar classes do Tailwind CSS (MANTENHA!)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ===================================================================
// ADICIONE A NOVA FUNÇÃO PARA FORMATAR PREÇOS AQUI
// ===================================================================

/**
 * Formata um valor numérico como moeda brasileira (R$).
 * @param value O valor a ser formatado. Pode ser um número ou uma string.
 * @returns O valor formatado como string. Ex: "R$ 45,50"
 */
export function formatCurrency(value: number | string): string {
  // Converte para número, caso o valor venha como string do banco de dados (Decimal)
  const numericValue = typeof value === "string" ? parseFloat(value) : value;

  // Verifica se o valor é um número válido antes de formatar
  if (isNaN(numericValue)) {
    return ""; // Ou retorne um valor padrão como "R$ 0,00"
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(numericValue);
}