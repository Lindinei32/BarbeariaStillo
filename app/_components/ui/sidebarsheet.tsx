"use client"

import { LogOutIcon, MenuIcon } from "lucide-react"
import Link from "next/link"
import { quickSearchOptions } from "@/app/_constants/search"
import Image from "next/image"
import { Dialog, DialogContent, DialogTrigger } from "./dialog"
import { signOut, useSession } from "next-auth/react"
import { Avatar, AvatarImage, AvatarFallback } from "./avatar"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./sheet"
import { Button } from "./button"
import SignInDialog from "./sign-in-dialog"
import React from "react"

const SidebarSheet = () => {
  const { data } = useSession()

  const handleLogoutClick = () => signOut()

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="border-2 border-[#844816]"
        >
          <MenuIcon />
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto border-2 border-[#844816] bg-[#121212] text-white">
        <SheetHeader className="bg-[#121212]">
          <SheetTitle className="text-left">Menu</SheetTitle>
        </SheetHeader>

        <div className="flex items-center border-b border-solid border-yellow-300 p-5">
          {data?.user ? (
            <div className="flex flex-grow items-center gap-5">
              <Avatar className="m-0 ring-2 h-14 w-14 ring-yellow-300 ">
                <AvatarImage src={data.user?.image ?? ""} />
                <AvatarFallback className="bg-[#1a1a1a] text-xl font-semibold uppercase">
                  {data?.user?.name?.charAt(0)?.toUpperCase() ?? "?"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-bold">{data.user.name}</p>
                <p className="text-sm">{data.user.email}</p>
              </div>
            </div>
          ) : (
            <>
              <h2 className="flex-grow font-bold">Olá, Faça seu Login!</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    size="icon"
                    variant="outline"
                    className="border-none"
                  >
                    <LogOutIcon />
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[90%] border border-[#844816] bg-[#121212] text-white">
                  <SignInDialog />
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>

        {!data?.user?.isAdmin && (
          <div className="flex flex-col gap-2 border-b border-solid border-yellow-300 py-5">
            {quickSearchOptions.map((option) => (
              <SheetClose key={option.title} asChild>
                <Button className="justify-start gap-2" variant="ghost" asChild>
                  <Link href={`/`}>
                    <Image
                      alt={option.title}
                      src={option.imageUrl}
                      width={18}
                      height={18}
                    />
                    {option.title}
                  </Link>
                </Button>
              </SheetClose>
            ))}
          </div>
        )}

        {data?.user && (
          <div className="flex flex-col gap-2 border-b border-solid border-yellow-300 py-5">
            <Button
              className="justify-start gap-2 text-white"
              variant="ghost"
              onClick={handleLogoutClick}
            >
              <LogOutIcon size={18} />
              Sair da Conta
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
export default SidebarSheet
