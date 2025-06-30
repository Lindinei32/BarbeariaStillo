import { signIn } from "next-auth/react"
import { DialogTitle, DialogDescription, DialogHeader } from "./dialog"
import { Button } from "./button"
import Image from "next/image"

const SignInDialog = () => {
  const handleLoginWithGoogleClick = async () => {
    await signIn("google", {
      callbackUrl: "/redirect",
    })
  }

  return (
    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-[#FFD700] bg-[#121212] p-5 text-white">
      <DialogHeader>
        <DialogTitle>Faça seu Login para Reservar</DialogTitle>
        <DialogDescription>
          Conecte-se usando a sua Conta Google
        </DialogDescription>
      </DialogHeader>
      <Button
        variant="outline"
        className="mt-5 gap-2 border-2 border-[#221d3d] bg-[#9c6a1c] hover:bg-[#9c6a1c]"
        onClick={handleLoginWithGoogleClick}
      >
        <Image src="/google.svg" alt="Google" width={18} height={18} />
        Google
      </Button>
    </div>
  )
}

export default SignInDialog
