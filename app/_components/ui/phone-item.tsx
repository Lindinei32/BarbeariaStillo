// app/_components/ui/PhoneItem.tsx

"use client";

import { SmartphoneIcon } from "lucide-react";
import { Button } from "./button";
import { toast } from "sonner";

interface PhoneItemProps {
  phone: string;
  key: string; 
}

const PhoneItem = ({ phone, key }: PhoneItemProps) => {
  const handleCopyPhoneClick = (phone: string) => {
    try {
      navigator.clipboard.writeText(phone);
      toast.success("Telefone copiado com sucesso", {
        style: {
          color: '#9bfd09',
        },
      });
    } catch (error) {
      console.error("Erro ao copiar telefone:", error);
      toast.error("Erro ao copiar telefone");
    }
  };

  return (
    <div key={key} className="flex items-center justify-between">
      {/* Esquerda */}
      <div className="flex items-center gap-2 font-semibold">
        <SmartphoneIcon />
        <p className="text-[#FFD700]">{phone}</p>
      </div>
      {/* Direita */}
      {/* =================================================================== */}
      {/* A ÚNICA MUDANÇA ESTÁ AQUI NA LINHA ABAIXO                         */}
      {/* =================================================================== */}
      {/* Removemos o 'text-white' e mantivemos apenas o '!text-white'      */}
      <Button
        className="border-[#ab8059] bg-[#9c6a1c] font-bold transition-none hover:border-[#FF9000] hover:bg-[#311d1c] !text-white rounded-full"
        onClick={() => handleCopyPhoneClick(phone)}
        aria-label={`Copiar número de telefone ${phone}`}
      >
        Copiar
      </Button>
    </div>
  );
};

export default PhoneItem;