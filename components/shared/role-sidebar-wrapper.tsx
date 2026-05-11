"use client"

import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export function RoleSidebarWrapper() {
    return (
        <SidebarProvider>
            <AppSidebar />
        </SidebarProvider>
    )
}
