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
            <div className="glass-island flex min-h-[270px] flex-col items-center justify-center gap-4 p-5 text-center sm:p-8">
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
        <div className="glass-island rounded-md p-4 sm:p-6">
            <div className="mt-1 divide-y divide-gray-200">
                {documents.map((document) => (
                    <div key={document.id} className="flex flex-col gap-3 py-4 sm:min-h-[60px] sm:flex-row sm:items-center sm:gap-4">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-black/8 text-black/40 sm:h-10 sm:w-10">
                            <FileTextIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                        </div>

                        <div className="min-w-0 flex-1">
                            <p className="break-words text-[15px] font-medium text-navy sm:truncate sm:text-base">{document.title}</p>
                            <p className="text-[13px] muted-text sm:text-[14px]">{document.date}</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap sm:justify-end">
                            {document.status === "ready" ? (
                                <>
                                    <button
                                        type="button"
                                        className="flex h-10 w-10 min-w-[44px] items-center justify-center rounded-xl bg-black/8 text-black/55 sm:h-11 sm:w-11"
                                        aria-label="Télécharger"
                                    >
                                        <DownloadIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                                    </button>
                                    <button
                                        type="button"
                                        className="flex h-10 w-10 min-w-[44px] items-center justify-center rounded-xl bg-[var(--color-orange)] text-white sm:h-11 sm:w-11"
                                        aria-label="Voir"
                                    >
                                        <EyeIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                                    </button>
                                </>
                            ) : (
                                <span className="rounded-full bg-[color-mix(in_srgb,var(--color-orange)_18%,white)] px-2.5 py-1.5 text-[13px] font-medium text-orange sm:px-3 sm:py-2 sm:text-[14px]">
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
