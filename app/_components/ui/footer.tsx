import { Card, CardContent } from "./card"

const Footer = () => {
  return (
    <footer>
      <Card className="overflow-hidden rounded-2xl border border-[##FFD700] bg-card shadow-[1px_1px_0px_#FF9000,-1px_-1px_0px_#FF9000]">
        <CardContent className="px-5 py-2">
          <p className="text-center text-lg font-bold text-[#FFD700]">
            Barbearia Stillo
          </p>
          
          <p className="text-center text-sm text-white mt-2 font-semibold">
          Av. Benjamin Possebon, 1041 Quissisana -
            <span> São José dos Pinhais </span>
          </p>
          <p className="mt-2 text-center text-white font-semibold">
            <span>Atendimentos de Terça-feira a Sábado </span>
          </p>
        </CardContent>
      </Card>
    </footer>
  )
}

export default Footer
