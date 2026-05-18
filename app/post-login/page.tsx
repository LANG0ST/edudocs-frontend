"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '@/lib/auth-client'

export default function PostLoginPage() {
    const router = useRouter()
    const session = useSession()
    const role = (session?.data?.user as { role?: string } | undefined)?.role

    useEffect(() => {
        if (!session?.data?.user) {
            return
        }

        if (role === 'SCOLARITE') {
            router.replace('/scolarite')
            return
        }

        if (role === 'STUDENT' || role === 'SUPER_ADMIN') {
            router.replace('/dashboard')
            return
        }

        router.replace('/')
    }, [router, role, session?.data?.user])

    return (
        <main className="flex min-h-screen items-center justify-center bg-[#F5F0EB] px-4 text-[#1B2B4B]">
            <div className="rounded-3xl border border-white/60 bg-white/80 px-6 py-5 shadow-[0_20px_60px_rgba(27,43,75,0.08)] backdrop-blur-sm">
                <p className="text-sm font-medium uppercase tracking-wide text-[#5C667A]">
                    Connexion en cours
                </p>
                <h1 className="mt-1 text-xl font-bold">Redirection...</h1>
            </div>
        </main>
    )
}
