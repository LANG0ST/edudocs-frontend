"use client"

import { ReactNode, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { ScolariteMobileNav } from '@/components/shared/scolarite-mobile-nav'
import { useSession } from '@/lib/auth-client'

type LayoutProps = {
    children: ReactNode
}

export default function ScolariteLayout({ children }: LayoutProps) {
    const router = useRouter()
    const session = useSession()
    const user = session?.data?.user as { role?: string } | undefined

    useEffect(() => {
        if (session?.data?.user === undefined) {
            return
        }

        if (!session?.data?.user) {
            router.replace('/')
            return
        }

        if (user?.role && user.role !== 'SCOLARITE') {
            router.replace('/dashboard')
        }
    }, [router, session, user?.role])

    if (session?.data?.user === undefined) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#F5F0EB] text-[#1B2B4B]">
                <div className="rounded-3xl border border-white/60 bg-white/80 px-6 py-5 shadow-[0_20px_60px_rgba(27,43,75,0.08)] backdrop-blur-sm">
                    <p className="text-sm font-medium uppercase tracking-wide text-[#5C667A]">Chargement</p>
                    <h1 className="mt-1 text-xl font-bold">Vérification du profil...</h1>
                </div>
            </main>
        )
    }

    if (!session?.data?.user) {
        return null
    }

    if (user?.role && user.role !== 'SCOLARITE') {
        return null
    }

    return (
        <>
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset className="bg-transparent text-[#1B2B4B] min-h-[100dvh] overflow-y-auto overflow-x-hidden p-4 pb-24 sm:p-6 lg:p-6 md:pb-0">
                    {children}
                </SidebarInset>
            </SidebarProvider>
            <ScolariteMobileNav />
        </>
    )
}
