// app/_components/ui/admin-hours-form.tsx

"use client";

import { Barbershop } from "@prisma/client";
import { FormEvent } from "react"; // Importa o tipo de evento do formulário

import { Input } from "./input";
import { Button } from "./button";

// As funções de lógica (toast, actions) foram movidas para o pai.
// Este componente agora é apenas para exibição.

interface AdminHoursFormProps {
  barbershop: Barbershop;
  onSaveSubmit: (event: FormEvent<HTMLFormElement>) => void; // Recebe a função de salvar
  onClearClick: () => void; // Recebe a função de limpar
}

const AdminHoursForm = ({ barbershop, onSaveSubmit, onClearClick }: AdminHoursFormProps) => {

  return (
    <div className="rounded-lg border border-primary bg-card p-4">
      {barbershop.openingTime ? (
        // MODO "BLOQUEADO"
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="font-semibold text-white">O horário de hoje já está definido:</p>
          <div className="text-xl font-bold text-primary">
            <span>{barbershop.openingTime}</span> - <span>{barbershop.closingTime}</span>
          </div>
          <p className="text-sm text-gray-400">Para definir um novo horário, primeiro limpe o atual.</p>
          <Button
            type="button"
            variant="destructive"
            className="w-full mt-2"
            onClick={onClearClick} // <-- Chama a função do pai
          >
            Limpar Horários
          </Button>
        </div>
      ) : (
        // MODO "LIBERADO"
        <form onSubmit={onSaveSubmit} className="flex flex-col gap-4"> {/* <-- USA onSubmit em vez de action */}
          <input type="hidden" name="barbershopId" value={barbershop.id} />
          <p className="text-sm font-semibold text-gray-300 text-center">Defina os horários de atendimento para hoje.</p>
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label htmlFor="openingTime" className="text-sm text-gray-300">Abertura</label>
              <Input id="openingTime" name="openingTime" type="time" className="mt-1 bg-secondary text-white" required />
            </div>
            <div className="flex-1">
              <label htmlFor="closingTime" className="text-sm text-gray-300">Fechamento</label>
              <Input id="closingTime" name="closingTime" type="time" className="mt-1 bg-secondary text-white" required />
            </div>
          </div>
          <Button type="submit" className="mt-2 w-full bg-primary hover:bg-primary/90">
            Salvar Horários
          </Button>
        </form>
      )}
    </div>
  );
};

export default AdminHoursForm;