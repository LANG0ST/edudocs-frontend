"use client"

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { StudentMobileNav } from '@/components/shared/student-mobile-nav';
import { useSession } from '@/lib/auth-client';

type LayoutProps = {
    children: ReactNode;
};

export default function EtudiantLayout({ children }: LayoutProps) {
    const router = useRouter();
    const session = useSession();

    useEffect(() => {
        if (session?.data?.user === undefined) {
            return;
        }

        if (!session?.data?.user) {
            router.replace('/');
        }
    }, [router, session]);

    if (session?.data?.user === undefined) {
        return null;
    }

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="bg-transparent text-[#1B2B4B] h-screen p-4 pb-24 sm:p-6 lg:p-6">
                {children}
            </SidebarInset>
            <StudentMobileNav />
        </SidebarProvider>
    );
}