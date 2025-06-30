import { getServerSession } from "next-auth"
import { authOptions } from "../_lib/auth"
import { redirect } from "next/navigation"

export default async function RedirectPage() {
  const session = await getServerSession(authOptions)

  if (session?.user?.name === "Barbearia Stillo" && session.user.email === "stillobarbearia99@gmail.com") {
    redirect("/adm")
  } else {
    redirect("/")
  }
}