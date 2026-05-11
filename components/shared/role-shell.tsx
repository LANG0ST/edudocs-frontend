import { ReactNode } from 'react';

type RoleShellProps = {
    title: string;
    sidebar: ReactNode;
    children: ReactNode;
};

export function RoleShell({ title, sidebar, children }: RoleShellProps) {
    return (
        <div className="min-h-screen bg-[#F5F0EB] text-[#1B2B4B]">
            <div className="mx-auto flex w-full max-w-[1440px]">
                <aside className="min-h-screen w-72 border-r border-[#E5DDD5] bg-[#132447] text-white">
                    {sidebar}
                </aside>
                <main className="flex-1 p-6">
                    <h1 className="mb-6 text-xl font-semibold">{title}</h1>
                    {children}
                </main>
            </div>
        </div>
    );
}