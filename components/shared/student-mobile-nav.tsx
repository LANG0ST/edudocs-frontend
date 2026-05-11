"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { HomeIcon, FilePlus2Icon, FolderOpenIcon, ClipboardListIcon } from "lucide-react"
import { cn } from "@/lib/utils"

function MobileNavLink({ href, active, label, children }: { href: string; active: boolean; label: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={cn(
        "flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl transition-colors",
        active ? "bg-[var(--color-orange)] text-white" : "text-navy",
      )}
      aria-label={label}
    >
      {children}
    </Link>
  )
}

export function StudentMobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed right-0 bottom-0 left-0 z-30 border-t border-[rgba(3,23,61,0.08)] bg-white/90 px-3 py-2 backdrop-blur-md md:hidden">
      <div className="grid grid-cols-4 gap-2">
        <MobileNavLink href="/dashboard" active={pathname === "/dashboard"} label="Tableau de bord">
          <HomeIcon className="h-5 w-5" />
        </MobileNavLink>
        <MobileNavLink href="/portfolio" active={pathname.startsWith("/portfolio")} label="Mes documents">
          <FolderOpenIcon className="h-5 w-5" />
        </MobileNavLink>
        <MobileNavLink href="/demande/nouvelle" active={pathname.startsWith("/demande/nouvelle")} label="Nouvelle demande">
          <FilePlus2Icon className="h-5 w-5" />
        </MobileNavLink>
        <MobileNavLink href="/demande/mes-demandes" active={pathname.startsWith("/demande/mes-demandes")} label="Mes demandes">
          <ClipboardListIcon className="h-5 w-5" />
        </MobileNavLink>
      </div>
    </nav>
  )
}