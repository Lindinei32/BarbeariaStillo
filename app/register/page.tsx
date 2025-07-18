// app/register/page.tsx


import Header from "../_components/ui/header"; // Importa o Header para manter a navegação
import RegisterForm from "../_components/ui/register-form";

// Esta é uma página simples que renderiza o header e o formulário de cadastro.
export default function RegisterPage() {
  return (
    <>
      <div className="p-5">
        <Header />
      </div>

      <div className="flex flex-col items-center justify-center px-4 py-8">
        <RegisterForm />
      </div>
    </>
  );
}
