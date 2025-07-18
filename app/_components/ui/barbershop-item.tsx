// app/_components/ui/barbershop-item.tsx

// Nenhuma alteração é necessária aqui. O componente é puramente visual.

import { Card, CardContent } from "./card";
import Image from "next/image";

const BarbershopItem = () => {
  // Os dados são estáticos e definidos dentro do próprio componente,
  // por isso não dependem da conexão com o banco de dados.
  const images = [
    { src: "/corte5.jpg", alt: "Barbeiro trabalhando no interior da barbearia" },
    { src: "/corte6.jpg", alt: "Fachada da Barbearia Stillo" },
    { src: "/corte3.jpg", alt: "Penteado Masculino com Barba" },
    { src: "/corte4.jpg", alt: "Compilado de Cortes" },
    { src: "/corte2.jpg", alt: "Menino com cabelo estiloso" },
    { src: "/corte1.jpg", alt: "Um senhor com cabelo curto" },
    { src: "/corte7.jpg", alt: "Fachada da Barbearia Stillo" },
    { src: "/corte8.jpg", alt: "Fachada da Barbearia Stillo" },
  ];

  return (
    <Card className="w-full border-2 border-[#9c6a1c] bg-card shadow-[1px_1px_0px_#844816,-1px_-1px_0px_#844816] overflow-hidden rounded-xl">
      <CardContent className="flex gap-3 p-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {images.map((image, index) => (
          <div
            key={image.src}
            className="relative flex-shrink-0 w-[159px] h-[159px] overflow-hidden rounded-md"
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              className="object-cover rounded-md"
              sizes="159px"
              priority={index === 0}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default BarbershopItem;
