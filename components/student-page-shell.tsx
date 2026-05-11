import { ReactNode } from 'react'

interface StudentPageShellProps {
    eyebrow?: string
    title: string
    description?: string
    actions?: ReactNode
    children: ReactNode
}

export function StudentPageShell({ eyebrow, title, description, actions, children }: StudentPageShellProps) {
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    {eyebrow ? <p className="text-sm text-[#6B7280]">{eyebrow}</p> : null}
                    <h1 className="text-3xl font-bold text-[#1B2B4B]">{title}</h1>
                    {description ? <p className="mt-1 text-[#6B7280]">{description}</p> : null}
                </div>
                {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
            </div>
            {children}
        </div>
    )
}
