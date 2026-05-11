"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { LogOutIcon } from "lucide-react"

export function NavUser({
  user,
  onLogout,
  isLoading,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
  onLogout?: () => void
  isLoading?: boolean
}) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className="rounded-2xl border border-white/15 bg-white/8 p-3 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <Avatar className="h-11 w-11 rounded-full bg-[var(--color-orange)]">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="rounded-full bg-[var(--color-orange)] text-white text-[14px] font-semibold">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left leading-tight">
              <span className="truncate text-[15px] font-medium text-white">{user.name}</span>
              <span className="truncate text-[14px] text-white/70">{user.email}</span>
            </div>
          </div>

          {onLogout ? (
            <Button
              type="button"
              variant="outline"
              onClick={onLogout}
              disabled={isLoading}
              className="mt-3 h-11 w-full border-white/20 bg-white/6 text-[15px] text-white hover:bg-white/14"
            >
              <LogOutIcon className="mr-2 h-4 w-4" />
              {isLoading ? "Déconnexion..." : "Déconnexion"}
            </Button>
          ) : null}
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
