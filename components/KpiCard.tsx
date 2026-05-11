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
                className="flex min-h-[140px] min-w-[44px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-[rgba(3,23,61,0.08)] bg-transparent p-6 text-center"
            >
                <p className="text-lg font-semibold leading-tight text-[var(--color-navy)]">{title}</p>
                <span className="mt-4 flex h-9 w-9 items-center justify-center rounded-full border-2 border-[rgba(3,23,61,0.08)] text-[var(--color-navy)]">
                    <PlusIcon className="h-5 w-5" />
                </span>
            </button>
        )
    }
    return (
        <button
            type="button"
            onClick={onClick}
            className="relative flex min-h-[170px] w-full flex-col justify-between rounded-xl border-2 bg-white p-4 text-left sm:p-5"
            style={{ borderColor: 'rgba(3,23,61,0.08)' }}
        >
            <div className="flex items-start justify-between px-2">
                <div className="flex h-16 w-16 items-center justify-center rounded bg-gray-100 p-1.5">
                    <img
                        src={imageSrc}
                        alt={title}
                        className="h-full w-full object-contain"
                        onError={(e) => { e.currentTarget.style.display = "none" }}
                    />
                </div>

                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-orange)] border border-[rgba(3,23,61,0.08)] text-white">
                    <CirclePlus className="h-6 w-6" />
                </span>
            </div>

            <h3 className="text-left px-2 py-2 text-[20px] font-bold leading-snug text-[var(--color-navy)]">
                {title}
            </h3>
        </button>
    )
}