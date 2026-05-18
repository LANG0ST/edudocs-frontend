import { DownloadIcon } from "lucide-react"

type StudentCardProps = {
    name: string
    cne?: string | null
}

export function StudentCard({ name, cne }: StudentCardProps) {
    const handleDownload = () => {
        console.log("PWA CARD")
    }

    return (
        <div
            className="relative aspect-[1.6/1] w-full overflow-hidden rounded-2xl bg-cover bg-center"
            style={{ backgroundImage: "url('/images/card.png')" }}
        >
            <div className="absolute inset-0 flex flex-col justify-end p-[6%] text-left">
                <div className="w-full max-w-full space-y-1" style={{ paddingBottom: '2%' }}>
                    <p
                        className="break-words font-bold uppercase leading-tight tracking-wide text-white"
                        style={{ fontSize: 'clamp(16px, 2.8vw, 32px)', lineHeight: 1 }}
                    >
                        {name || "Etudiant"}
                    </p>
                    <p
                        className="break-words font-bold leading-tight tracking-wide text-white/90"
                        style={{ fontSize: 'clamp(12px, 2vw, 20px)', lineHeight: 1 }}
                    >
                        {cne || "W470255"}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleDownload}
                    className="mt-3 inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-white/35 bg-white/15 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-[2px] transition hover:bg-white/25"
                >
                    <DownloadIcon className="h-4 w-4" aria-hidden="true" />
                    <span className="truncate">Telecharger votre E-Card</span>
                </button>
            </div>
        </div>
    )
}
