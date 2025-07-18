// app/_components/ui/HomeClient.tsx

// NENHUMA MUDANÇA É NECESSÁRIA NESTE ARQUIVO.

'use client'

import useSWR from 'swr'

// A função 'fetcher' que o useSWR usa para buscar os dados.
const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function HomeClient() {
  // O useSWR busca os dados na API e os revalida a cada 5 segundos.
  // A variável 'data' aqui irá conter o objeto único da barbearia retornado pela API.
  const { data, error, isLoading } = useSWR('/api/barbershop', fetcher, {
    refreshInterval: 5000,
  })

  // Renderiza um estado de carregamento enquanto os dados não chegam.
  if (isLoading) {
    return (
      <div className="mt-6">
        <div className="rounded-lg border border-primary bg-card p-3 text-center shadow-md">
          <h3 className="font-bold text-white">Carregando horário...</h3>
        </div>
      </div>
    )
  }

  // Se houver um erro ou a API retornar um objeto com a propriedade 'error',
  // o componente não renderiza nada.
  if (error || !data || data.error) {
    return null
  }

  // Se houver dados e eles contiverem os horários, exibe o card de "Aberto".
  // Acessa diretamente `data.openingTime` porque 'data' é o objeto da barbearia.
  return data.openingTime && data.closingTime ? (
    <div className="mt-6">
      <div className="rounded-lg border border-primary bg-card p-3 text-center shadow-md">
        <h3 className="font-bold text-white">
          Hoje aberto das{' '}
          <span className="font-extrabold text-primary">
            {data.openingTime}
          </span>{' '}
          às{' '}
          <span className="font-extrabold text-primary">
            {data.closingTime}
          </span>
        </h3>
      </div>
    </div>
  ) : (
    // Caso contrário, exibe o card de "Fechado".
    <div className="mt-6">
      <div className="rounded-lg border border-primary bg-card p-3 text-center shadow-md">
        <h3 className="font-bold text-white">Fechado</h3>
      </div>
    </div>
  )
}