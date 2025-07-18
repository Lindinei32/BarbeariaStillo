import { Facebook, Instagram } from "lucide-react";

const Mediasocial = () => {
    return (
      <>
      {/* Ícones de Redes Sociais Centralizados */}
      <div className="flex justify-center gap-4 mb-4">
        <a
          href="https://www.facebook.com/barbeariastillo/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Link para o Facebook"
        >
          <Facebook className="w-8 h-8 text-blue-500 hover:text-blue-700 transition-colors" />
        </a>
        <a
          href="https://www.instagram.com/explore/locations/1040312092670552/barbearia-stillo/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Link para o Instagram"
        >
          <Instagram className="w-8 h-8 text-pink-500 hover:text-pink-700 transition-colors" />
        </a>
      </div>
    </>
    );
} 
export default Mediasocial