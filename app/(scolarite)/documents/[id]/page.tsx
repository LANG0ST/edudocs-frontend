'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { motion } from 'framer-motion'
import { ArrowLeft, Download, ExternalLink, FileText, UserRound } from 'lucide-react'
import { useSession } from '@/lib/auth-client'
import { api, type DocumentPreview } from '@/lib/api'

const typeDocumentLabel: Record<string, string> = {
    RELEVE_DE_NOTES: 'Relevé de notes',
    CERTIFICAT_SCOLARITE: 'Certificat de scolarité',
    ATTESTATION_INSCRIPTION: "Attestation d'inscription",
    ATTESTATION_REUSSITE: 'Attestation de réussite',
    ATTESTATION_CLASSEMENT: 'Attestation de classement',
    DIPLOME: 'Diplôme fin d\'études',
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-start justify-between gap-4 py-3" style={{ borderBottom: '1px solid rgba(3,23,61,0.07)' }}>
            <span className="text-[12px]" style={{ color: 'rgba(3,23,61,0.5)' }}>{label}</span>
            <span className="text-right text-[12px] font-semibold" style={{ color: 'var(--color-navy)' }}>{value}</span>
        </div>
    )
}

export default function ScolariteDocumentViewerPage() {
    const session = useSession()
    const params = useParams<{ id: string }>()
    const [document, setDocument] = useState<DocumentPreview | null>(null)
    const [loading, setLoading] = useState(true)

    const previewSrc = document?.downloadUrl ?? '/images/placeholder.pdf'

    useEffect(() => {
        const load = async () => {
            try {
                const data = await api.getDocumentPreview(params.id)
                setDocument(data ?? null)
            } catch {
                setDocument(null)
            } finally {
                setLoading(false)
            }
        }

        if (session?.data?.user && params.id) {
            load()
        }
    }, [params.id, session])

    if (loading) {
        return (
            <div className="px-4 py-6 md:px-8 md:py-8">
                <div className="h-8 w-56 animate-pulse rounded-lg mb-6" style={{ backgroundColor: 'rgba(3,23,61,0.07)' }} />
                <div className="space-y-6">
                    <div className="h-40 animate-pulse rounded-xl" style={{ backgroundColor: 'rgba(3,23,61,0.05)' }} />
                    <div className="h-[70vh] animate-pulse rounded-xl" style={{ backgroundColor: 'rgba(3,23,61,0.05)' }} />
                </div>
            </div>
        )
    }

    const student = document?.etudiant
    const title = document ? (typeDocumentLabel[document.typeDocument] ?? document.typeDocument) : 'Document introuvable'

    return (
        <div className="px-4 py-6 md:px-8 md:py-8">
            <div className="mb-6 flex items-center gap-2">
                <Link
                    href="/scolarite"
                    className="flex items-center gap-1.5 text-[13px] font-medium transition-colors"
                    style={{ color: 'rgba(3,23,61,0.5)' }}
                >
                    <ArrowLeft className="h-4 w-4" />
                    Espace Scolarité
                </Link>
                <span style={{ color: 'rgba(3,23,61,0.25)' }}>/</span>
                <span className="text-[13px] font-medium" style={{ color: 'var(--color-navy)' }}>{title}</span>
            </div>

            <div className="grid gap-6">
                <div className="overflow-hidden rounded-xl border bg-white" style={{ borderColor: 'rgba(3,23,61,0.1)' }}>
                    <div className="flex items-center justify-between gap-3 px-4 py-3" style={{ borderBottom: '1px solid rgba(3,23,61,0.08)' }}>
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: 'var(--color-orange)' }}>
                                <UserRound className="h-4 w-4 text-white" />
                            </div>
                            <div>
                                <p className="text-[13px] font-semibold" style={{ color: 'var(--color-navy)' }}>Informations étudiant</p>
                                <p className="text-[11px]" style={{ color: 'rgba(3,23,61,0.45)' }}>
                                    {student?.etablissement || 'ENSA MARRAKECH'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <a
                                href={previewSrc}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[12px] font-medium transition-colors"
                                style={{ borderColor: 'rgba(3,23,61,0.15)', color: 'var(--color-navy)' }}
                            >
                                <ExternalLink className="h-3.5 w-3.5" />
                                Ouvrir
                            </a>
                            <a
                                href={api.getDocumentDownloadUrl(document?.id ?? '')}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1.5 rounded-lg bg-[var(--color-orange)] px-3 py-1.5 text-[12px] font-semibold text-white"
                            >
                                <Download className="h-3.5 w-3.5" />
                                Télécharger
                            </a>
                        </div>
                    </div>

                    <div className="grid gap-0 md:grid-cols-2">
                        <div className="px-5 py-1">
                            <InfoRow label="Nom" value={student?.name || '—'} />
                            <InfoRow label="CNE" value={student?.cne || '—'} />
                            <InfoRow label="Établissement" value={student?.etablissement || 'ENSA MARRAKECH'} />
                        </div>
                        <div className="px-5 py-1 md:border-l" style={{ borderColor: 'rgba(3,23,61,0.07)' }}>
                            <InfoRow label="Filière" value={student?.filiere || '—'} />
                            <InfoRow label="Classe" value={student?.classe || '—'} />
                            <InfoRow label="Type" value={title} />
                        </div>
                    </div>

                    {document && (
                        <div className="px-5 pb-4 text-[12px]" style={{ color: 'rgba(3,23,61,0.5)' }}>
                            Émis le {format(new Date(document.emissLe), 'd MMMM yyyy', { locale: fr })}
                        </div>
                    )}
                </div>

                <div className="overflow-hidden rounded-xl border bg-white" style={{ borderColor: 'rgba(3,23,61,0.1)' }}>
                    <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: '1px solid rgba(3,23,61,0.08)' }}>
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: 'var(--color-navy)' }}>
                            <FileText className="h-4 w-4 text-white" />
                        </div>
                        <div>
                            <p className="text-[13px] font-semibold" style={{ color: 'var(--color-navy)' }}>{title}</p>
                            <p className="text-[11px]" style={{ color: 'rgba(3,23,61,0.45)' }}>
                                {document?.anneeAcademique || ''}{document?.semestre ? ` · ${document.semestre}` : ''}
                            </p>
                        </div>
                    </div>

                    <div className="p-3" style={{ backgroundColor: 'rgba(3,23,61,0.03)' }}>
                        <div className="overflow-hidden rounded-lg" style={{ height: 'calc(100vh - 300px)', minHeight: 520 }}>
                            <iframe title="Aperçu du document" src={previewSrc} className="h-full w-full" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
