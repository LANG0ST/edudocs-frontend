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

    return (
        <>
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset className="bg-transparent text-[#1B2B4B] min-h-[100dvh] overflow-y-auto overflow-x-hidden p-4 pb-24 sm:p-6 lg:p-6 md:pb-0">
                    {children}
                </SidebarInset>
            </SidebarProvider>
            <StudentMobileNav />
        </>
    );
}