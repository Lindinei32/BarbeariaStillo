// app/page.tsx

import Image from 'next/image'

// Importando os componentes
import Header from './_components/ui/header'
import ServiceItem from './_components/ui/service-item'
import PhoneItem from './_components/ui/phone-item'
import ClientBookingList from './_components/ui/client-booking-list'
import Mediasocial from './_components/ui/mediasocial'
import BarbershopItem from './_components/ui/barbershop-item'
import HomeClient from './_components/ui/home-client'
import WelcomeMessage from './_components/ui/welcome-message'

// Importando a conexão com o banco
import db from './_lib/db'

// Definindo os tipos para os dados da página
interface Service {
  id: string
  name: string
  price: string
  description: string
  imageUrl: string
}
interface Barbershop {
  id: string
  name: string
  address: string
  imageUrl: string
  services: Service[]
}

// Garante que a página seja sempre dinâmica
export const revalidate = 0

const Home = async () => {
  let barbershops: Barbershop[] = []

  try {
    // A Query SQL que busca barbearias e seus serviços.
    // O JOIN acontece aqui: b.id (UUID) = s."barbershopId" (deve ser UUID).
    const query = `
      SELECT
        b.id as "barbershopId",
        b.name as "barbershopName",
        b.address,
        b."imageUrl" as "barbershopImageUrl",
        s.id as "serviceId",
        s.name as "serviceName",
        s.price,
        s.description as "serviceDescription",
        s."imageUrl" as "serviceImageUrl"
      FROM
        "Barbershop" as b
      LEFT JOIN
        "BarbershopService" as s ON b.id = s."barbershopId"
      ORDER BY
        b."createdAt" ASC;
    `
    
    const result = await db.query(query);

    // Mapeamento para agrupar os serviços dentro de cada barbearia
    const barbershopsMap = result.rows.reduce((acc, row) => {
      if (!acc[row.barbershopId]) {
        acc[row.barbershopId] = {
          id: row.barbershopId,
          name: row.barbershopName,
          address: row.address,
          imageUrl: row.barbershopImageUrl,
          services: [],
        };
      }
      if (row.serviceId) {
        acc[row.barbershopId].services.push({
          id: row.serviceId,
          name: row.serviceName,
          price: row.price,
          description: row.serviceDescription,
          imageUrl: row.serviceImageUrl,
        });
      }
      return acc;
    }, {} as Record<string, Barbershop>);
    
    barbershops = Object.values(barbershopsMap);

  } catch (error) {
    console.error('Falha ao buscar dados da página inicial:', error);
  }

  const fixedPhones = ['(41) 99980-4744', '(41) 3382-7953'];

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <div className="flex-1 overflow-y-auto p-5">
        <WelcomeMessage />

        <div className="relative mt-6 h-[150px] w-full rounded-xl">
          <Image src="/estilo.png" fill className="rounded-xl object-cover" alt="Barbearia Stillo..." priority />
        </div>

        <HomeClient />
        <ClientBookingList />

        <div className="mt-6"><BarbershopItem /></div>

        <div className="mt-6">
          <h2 className="mb-3 uppercase text-[#F5F5FS5]">SERVIÇOS</h2>
          {barbershops.map((barbershop) => (
            <div key={barbershop.id} className="space-y-6">
              {barbershop.services.map((service) => (
                <ServiceItem key={service.id} service={JSON.parse(JSON.stringify(service))} barbershop={JSON.parse(JSON.stringify(barbershop))} />
              ))}
            </div>
          ))}
        </div>

        <div className="mt-6">
          <h2 className="mb-3 uppercase text-white">CONTATO</h2>
          <div className="space-y-3">
            {fixedPhones.map((phone, index) => (<PhoneItem key={index.toString()} phone={phone} />))}
            <Mediasocial />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;