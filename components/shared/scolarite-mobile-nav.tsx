"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { HomeIcon, CloudUploadIcon, ClipboardListIcon, HistoryIcon } from "lucide-react"
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

export function ScolariteMobileNav() {
    const pathname = usePathname()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return null
    }

    return createPortal(
        <nav className="fixed right-0 bottom-0 left-0 z-30 border-t border-[rgba(3,23,61,0.08)] bg-white/90 px-3 py-2 backdrop-blur-md md:hidden">
            <div className="grid grid-cols-4 gap-2">
                <MobileNavLink href="/scolarite" active={pathname === "/scolarite"} label="Tableau de bord">
                    <HomeIcon className="h-5 w-5" />
                </MobileNavLink>
                <MobileNavLink href="/demandes" active={pathname.startsWith("/demandes")} label="Demandes">
                    <ClipboardListIcon className="h-5 w-5" />
                </MobileNavLink>
                <MobileNavLink href="/upload-history" active={pathname.startsWith("/upload-history")} label="Historique">
                    <HistoryIcon className="h-5 w-5" />
                </MobileNavLink>
                <MobileNavLink href="/upload" active={pathname.startsWith("/upload")} label="Upload PDF">
                    <CloudUploadIcon className="h-5 w-5" />
                </MobileNavLink>
            </div>
        </nav>,
        document.body,
    )
}
