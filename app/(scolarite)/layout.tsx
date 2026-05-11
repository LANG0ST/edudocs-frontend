import { ReactNode } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { requireRole } from '@/lib/auth-role';

type LayoutProps = {
    children: ReactNode;
};

export default async function ScolariteLayout({ children }: LayoutProps) {
    await requireRole('SCOLARITE');

    return (
        <SidebarProvider>
            <AppSidebar />
            <main className="flex-1 bg-[#F5F0EB] text-[#1B2B4B] p-6 min-h-screen">
                {children}
            </main>
        </SidebarProvider>
    );
}