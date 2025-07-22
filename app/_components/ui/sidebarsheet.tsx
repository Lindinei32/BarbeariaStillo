// app/_components/ui/sidebarsheet.tsx

'use client'

import { LogOutIcon, MenuIcon, UserCog } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import React, { useState } from 'react'
import { useAuth } from '@/app/_context/AuthContext'
import SignInDialog from './sign-in-dialog'
import { quickSearchOptions } from '@/app/_constants/search'
import { Dialog, DialogContent, DialogTrigger } from './dialog'
import { Avatar, AvatarImage, AvatarFallback } from './avatar'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './sheet'
import { Button } from './button'

const SidebarSheet = () => {
  const { user, isLoading } = useAuth()
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false)
  // ===================================================================
  // AÇÃO 1: CRIAR UM ESTADO PARA CONTROLAR O MENU LATERAL (SHEET)
  // ===================================================================
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const handleLogoutClick = async () => {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' })
      if (response.ok) {
        window.location.href = '/'
      }
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  if (isLoading) {
    return <div className="h-8 w-8 animate-pulse rounded-md bg-gray-700" />
  }

  return (
    // ===================================================================
    // AÇÃO 2: CONTROLAR O ESTADO DO SHEET COM O NOSSO NOVO ESTADO
    // ===================================================================
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="border-2 border-[#844816]">
          <MenuIcon />
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto border-2 border-[#844816] bg-[#121212] text-white">
        <SheetHeader className="bg-[#121212]">
          <SheetTitle className="text-left">Menu</SheetTitle>
        </SheetHeader>

        <div className="flex items-center border-b border-solid border-yellow-300 p-5">
          {user ? (
            <div className="flex flex-grow items-center gap-5">
              <Avatar className="m-0 h-14 w-14 ring-2 ring-yellow-300">
                <AvatarImage src={user.image ?? ''} />
                <AvatarFallback className="bg-[#1a1a1a] text-xl font-semibold uppercase">
                  {user.name?.charAt(0)?.toUpperCase() ?? '?'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-bold">{user.name}</p>
              </div>
            </div>
          ) : (
            <>
              <h2 className="flex-grow font-bold">Olá, Faça seu Login!</h2>
              <Dialog
                open={isLoginDialogOpen}
                onOpenChange={setIsLoginDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="icon" variant="outline" className="border-none">
                    <LogOutIcon />
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[90%] border border-[#844816] bg-[#121212] text-white">
                  {/* =================================================================== */}
                  {/* AÇÃO 3: PASSAR UMA FUNÇÃO QUE FECHA TUDO PARA O SignInDialog   */}
                  {/* =================================================================== */}
                  <SignInDialog
                    onLoginSuccess={() => {
                      setIsLoginDialogOpen(false) // Fecha o diálogo de login
                      setIsSheetOpen(false) // Fecha o menu lateral
                    }}
                  />
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>

        {user && !user.isAdmin && (
          // Usamos 'SheetClose' aqui para que clicar nos links feche o menu
          <div className="flex flex-col gap-2 border-b border-solid border-yellow-300 py-5">
            {quickSearchOptions.map((option) => (
              // O componente SheetClose da ShadCN é perfeito para isso
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

        {user && user.isAdmin && (
          <div className="flex flex-col gap-2 border-b border-solid border-yellow-300 py-5">
            <SheetClose asChild>
              <Button className="justify-start gap-2" variant="ghost" asChild>
                <Link href="/adm">
                  <UserCog size={18} />
                  Painel Admin
                </Link>
              </Button>
            </SheetClose>
          </div>
        )}

        {user && (
          <div className="flex flex-col gap-2 border-b border-solid border-yellow-300 py-5">
            <Button
              className="justify-start gap-2 text-white"
              variant="ghost"
              onClick={handleLogoutClick}>
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
