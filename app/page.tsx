import Image from "next/image";
import Header from "./_components/ui/header";
import { db } from "./_lib/prisma";
import ServiceItem from "./_components/ui/service-item";
import { getServerSession } from "next-auth";
import { authOptions } from "./_lib/auth";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import PhoneItem from "./_components/ui/phone-item";
import ClientBookingList from "./_components/ui/client-booking-list";
import Mediasocial from "./_components/ui/mediasocial";
import BarbershopItem from "./_components/ui/barbershop-item";

const Home = async () => {
  const session = await getServerSession(authOptions);

  const barbershops = await db.barbershop.findMany({
    include: {
      services: true,
    },
    orderBy: { name: "asc" },
  });

  const fixedPhones = ["(41) 99980-4744", "(41) 3382-7953"];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <div className="p-5 flex-1 overflow-y-auto">
        <h2 className="text-xl text-[#F5F5F5]">
          Olá, {session?.user ? session.user.name : "Seja Bem-vindo"}
        </h2>
        <p className="mt-2 font-semibold text-white">
          <span className="capitalize">
            {format(new Date(), "EEEE, dd", { locale: ptBR })}
          </span>{" "}
          de{" "}
          <span>
            {format(new Date(), "MMMM", { locale: ptBR })
              .charAt(0)
              .toUpperCase() +
              format(new Date(), "MMMM", { locale: ptBR })
                .slice(1)
                .toLowerCase()}
          </span>{" "}
          de <span>{format(new Date(), "yyyy")}</span>
        </p>

        <div className="relative mt-6 h-[150px] w-full rounded-xl">
          <Image
            src="/estilo.png"
            fill
            className="rounded-xl object-cover"
            alt="Barbearia Stillo..."
            priority
          />
        </div>

        <ClientBookingList />

        
        <div className="mt-6">
          <BarbershopItem />
        </div>

        <div className="mt-6">
          <h2 className="mb-3 uppercase text-[#F5F5F5]]">Serviços</h2>
          {barbershops.map((barbershop) => (
            <div key={barbershop.id} className="space-y-3">
              {barbershop.services.map((service) => (
                <ServiceItem
                  key={service.id}
                  service={JSON.parse(JSON.stringify(service))}
                  barbershop={JSON.parse(JSON.stringify(barbershop))}
                />
              ))}
            </div>
          ))}
        </div>

        <div className="mt-6">
          <h2 className="mb-3 uppercase text-white">Contato</h2>
          <div className="space-y-3">
            {fixedPhones.map((phone, index) => (
              <PhoneItem key={index.toString()} phone={phone} />
            ))}
            <Mediasocial />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;