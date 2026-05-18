"use client"

import * as React from "react"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useSession } from "@/lib/auth-client"
import { authClient } from "@/lib/auth-client"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  BookOpenIcon,
  FileTextIcon,
  HomeIcon,
  ClipboardListIcon,
  UsersIcon,
  HistoryIcon,
  CloudUploadIcon,
} from "lucide-react"

export function AppSidebar({ activeRoute }: { activeRoute?: string }) {
  const session = useSession()
  const [isLoading, setIsLoading] = React.useState(false)
  const pathname = usePathname()
  const currentRoute = activeRoute || pathname

  const user = session?.data?.user as any
  const userRole = user?.role as string | undefined

  const getNavItems = () => {
    const baseItems = [
      {
        title: "Tableau de bord",
        url: "/dashboard",
        icon: <HomeIcon className="h-4 w-4" />,
        isActive: currentRoute === "/dashboard",
      },
    ]

    if (userRole === "STUDENT") {
      return [
        ...baseItems,
        {
          title: "Mes Documents",
          url: "/portfolio",
          icon: <BookOpenIcon className="h-4 w-4" />,
          isActive: currentRoute.startsWith("/portfolio"),
        },
        {
          title: "Nouvelle Demande",
          url: "/demande/nouvelle",
          icon: <FileTextIcon className="h-4 w-4" />,
          isActive: currentRoute.startsWith("/demande/nouvelle"),
        },
        {
          title: "Mes Demandes",
          url: "/demande/mes-demandes",
          icon: <ClipboardListIcon className="h-4 w-4" />,
          isActive: currentRoute.startsWith("/demande/mes-demandes"),
        },
      ]
    }

    if (userRole === "SCOLARITE") {
      return [
        {
          title: "Tableau de bord",
          url: "/scolarite",
          icon: <HomeIcon className="h-4 w-4" />,
          isActive: currentRoute === "/scolarite",
        },
        {
          title: "Demandes",
          url: "/demandes",
          icon: <ClipboardListIcon className="h-4 w-4" />,
          isActive: currentRoute.startsWith("/demandes"),
        },
        {
          title: "Historique",
          url: "/upload-history",
          icon: <HistoryIcon className="h-4 w-4" />,
          isActive: currentRoute.startsWith("/upload-history"),
        },
        {
          title: "Upload PDF",
          url: "/upload",
          icon: <CloudUploadIcon className="h-4 w-4" />,
          isActive: currentRoute === "/upload",
        },
      ]
    }

    if (userRole === "SUPER_ADMIN") {
      return [
        ...baseItems,
        {
          title: "Demandes",
          url: "/demandes",
          icon: <ClipboardListIcon className="h-4 w-4" />,
          isActive: currentRoute.startsWith("/demandes"),
          items: [
            { title: "Toutes", url: "/demandes" },
            { title: "En attente", url: "/demandes?status=EN_ATTENTE" },
          ],
        },
        {
          title: "Documents",
          url: "/documents",
          icon: <FileTextIcon className="h-4 w-4" />,
          isActive: currentRoute.startsWith("/documents"),
        },
        {
          title: "Utilisateurs",
          url: "/utilisateurs",
          icon: <UsersIcon className="h-4 w-4" />,
          isActive: currentRoute.startsWith("/utilisateurs"),
        },
      ]
    }

    return baseItems
  }

  const handleLogout = async () => {
    try {
      setIsLoading(true)
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            window.location.href = "/"
          },
        },
      })
    } catch (error) {
      console.error("Logout error:", error)
      setIsLoading(false)
    }
  }

  if (!user) return null

  const roleLabel =
    userRole === "STUDENT"
      ? "Étudiant"
      : userRole === "SCOLARITE"
        ? "Scolarité"
        : "Admin"

  return (

    <Sidebar
      className="sidebar-glass border-none hidden md:block"
      collapsible="offcanvas"
      variant="floating"

    >

      <SidebarHeader className="bg-transparent px-4 pt-6 pb-4">
        <div className="flex items-center gap-3 px-2">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-white/10 ring-1 ring-white/25">
            <Image
              src="/images/logo.png"
              alt="EduDocs"
              fill
              sizes="40px"
              className="object-contain p-1"
            />
          </div>
          <div>
            <h2 className="text-[15px] font-semibold text-white leading-tight">
              EDUDOCS
            </h2>
          </div>
        </div>

        <div className="mt-4 h-px w-full bg-white/10" />
      </SidebarHeader>

      <SidebarContent className="bg-transparent px-2 py-3">
        <NavMain items={getNavItems()} />
      </SidebarContent>

      <SidebarFooter className="bg-transparent p-3">
        <div className="mb-3 h-px w-full bg-white/10" />
        <NavUser
          user={{
            name: user.name || "Utilisateur",
            email: user.email || "",
            avatar: "",
          }}
          onLogout={handleLogout}
          isLoading={isLoading}
        />
      </SidebarFooter>

      <SidebarRail className="hidden" />
    </Sidebar>
  )
}