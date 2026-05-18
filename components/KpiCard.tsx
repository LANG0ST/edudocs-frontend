"use client"
import { CirclePlus, PlusIcon } from "lucide-react"

export interface KpiCardProps {
    title: string
    bgColor: string
    imageSrc: string
    onClick: () => void
    variant?: "filled" | "ghost"
}

export function KpiCard({ title, bgColor, imageSrc, onClick, variant = "filled" }: KpiCardProps) {
    if (variant === "ghost") {
        return (
            <button
                type="button"
                onClick={onClick}
                className="flex min-h-[120px] min-w-0 flex-col items-center justify-center rounded-xl border-2 border-dashed border-[rgba(3,23,61,0.08)] bg-transparent p-4 text-center transition-transform duration-300 hover:scale-105 sm:min-h-[140px] sm:p-6"
            >
                <p className="text-[clamp(0.85rem,3.1vw,1.125rem)] font-semibold leading-tight text-[var(--color-navy)]">{title}</p>
                <span className="mt-3 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[rgba(3,23,61,0.08)] text-[var(--color-navy)] sm:mt-4 sm:h-9 sm:w-9">
                    <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                </span>
            </button>
        )
    }
    return (
        <button
            type="button"
            onClick={onClick}
            className="relative flex min-h-[145px] w-full min-w-0 flex-col justify-between rounded-xl border-2 bg-white p-3 text-left transition-transform duration-300 hover:scale-105 sm:min-h-[170px] sm:p-5"
            style={{ borderColor: 'rgba(3,23,61,0.08)' }}
        >
            <div className="flex items-start justify-between gap-2 px-1 sm:px-2">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-gray-100 p-1.5 sm:h-16 sm:w-16">
                    <img
                        src={imageSrc}
                        alt={title}
                        className="h-full w-full object-contain"
                        onError={(e) => { e.currentTarget.style.display = "none" }}
                    />
                </div>

                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-orange)] text-white sm:h-9 sm:w-9">
                    <CirclePlus className="h-4 w-4 sm:h-6 sm:w-6" />
                </span>
            </div>

            <h3 className="px-1 py-2 text-left text-[clamp(0.95rem,4vw,1.25rem)] font-bold leading-snug text-[var(--color-navy)] sm:px-2">
                {title}
            </h3>
        </button>
    )
}