"use client";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function HomeClient() {
  const { data, error, isLoading } = useSWR("/api/barbershop", fetcher, {
    refreshInterval: 5000, // Atualiza a cada 5 segundos
  });

  if (isLoading) {
    return (
      <div className="mt-6">
        <div className="rounded-lg border border-primary bg-card p-3 text-center shadow-md">
          <h3 className="font-bold text-white">Carregando horário...</h3>
        </div>
      </div>
    );
  }

  if (error || !data || data.error) {
    return null;
  }

  if (!data.openingTime || !data.closingTime) {
    return null;
  }

  return (
    <div className="mt-6">
      <div className="rounded-lg border border-primary bg-card p-3 text-center shadow-md">
        <h3 className="font-bold text-white">
          Hoje aberto das {" "}
          <span className="font-extrabold text-primary">{data.openingTime}</span>{" "}
          às {" "}
          <span className="font-extrabold text-primary">{data.closingTime}</span>
        </h3>
      </div>
    </div>
  );
}
