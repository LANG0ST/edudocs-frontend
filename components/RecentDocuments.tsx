import Link from "next/link"
import { DownloadIcon, EyeIcon, FileTextIcon, InboxIcon } from "lucide-react"

export interface Document {
    id: string
    title: string
    date: string
    status: "ready" | "processing"
}

interface RecentDocumentsProps {
    documents: Document[]
}

export function RecentDocuments({ documents }: RecentDocumentsProps) {
    if (!documents.length) {
        return (
            <div className="glass-island flex min-h-[270px] flex-col items-center justify-center gap-4 p-8 text-center">
                <InboxIcon className="h-11 w-11 text-orange" />
                <p className="text-base font-medium text-navy">Aucune demande pour l'instant</p>
                <Link
                    href="/demande/nouvelle"
                    className="flex h-11 min-w-[44px] items-center justify-center rounded-xl bg-[var(--color-orange)] px-5 text-base font-medium text-white"
                >
                    Faire une demande
                </Link>
            </div>
        )
    }

    return (
        <div className="glass-island p-6 rounded-md ">
            <div className="mt-1 divide-y divide-gray-200">
                {documents.map((document) => (
                    <div key={document.id} className="flex min-h-[60px] items-center gap-4 py-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/8 text-black/40">
                            <FileTextIcon className="h-5 w-5" />
                        </div>

                        <div className="min-w-0 flex-1">
                            <p className="truncate text-base font-medium text-navy">{document.title}</p>
                            <p className="text-[14px] muted-text">{document.date}</p>
                        </div>

                        <div className="flex items-center gap-2">
                            {document.status === "ready" ? (
                                <>
                                    <button
                                        type="button"
                                        className="flex h-11 w-11 min-w-[44px] items-center justify-center rounded-xl bg-black/8 text-black/55"
                                        aria-label="Télécharger"
                                    >
                                        <DownloadIcon className="h-5 w-5" />
                                    </button>
                                    <button
                                        type="button"
                                        className="flex h-11 w-11 min-w-[44px] items-center justify-center rounded-xl bg-[var(--color-orange)] text-white"
                                        aria-label="Voir"
                                    >
                                        <EyeIcon className="h-5 w-5" />
                                    </button>
                                </>
                            ) : (
                                <span className="rounded-full bg-[color-mix(in_srgb,var(--color-orange)_18%,white)] px-3 py-2 text-[14px] font-medium text-orange">
                                    En traitement
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <Link href="/demande/mes-demandes" className="mt-5 inline-flex text-[15px] font-semibold text-orange">
                Voir tout →
            </Link>
        </div>
    )
}
