"use client"

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { KpiCard } from '@/components/KpiCard'
import { Download, Eye } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { api } from '@/lib/api'

const typeDocumentLabel: Record<string, string> = {
    RELEVE_DE_NOTES: 'Relevé de notes',
    CERTIFICAT_SCOLARITE: 'Certificat de scolarité',
    ATTESTATION_INSCRIPTION: "Attestation d'inscription",
    ATTESTATION_REUSSITE: 'Attestation de réussite',
    ATTESTATION_CLASSEMENT: 'Attestation de classement',
    DIPLOME: 'Diplôme',
}

export default function ScolariteHomePage() {
    const router = useRouter()

    return (
        <main className="px-4 py-6 md:px-8 md:py-8">
            <section>

                <h1 className="text-[36px] font-bold leading-tight text-orange">
                    Espace Scolarité
                </h1>
                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <KpiCard
                        title="Upload PDF"
                        bgColor="var(--color-card-blue)"
                        imageSrc="/images/KPI/Upload.png"
                        onClick={() => router.push('/upload')}
                    />
                    <KpiCard
                        title="Historique des uploads"
                        bgColor="var(--color-card-peach)"
                        imageSrc="/images/KPI/HISTORY.png"
                        onClick={() => router.push('/upload-history')}
                    />
                    <KpiCard
                        title="Demandes"
                        bgColor="var(--color-card-orange)"
                        imageSrc="/images/KPI/DEMANDES.png"
                        onClick={() => router.push('/demandes')}
                    />
                </div>
            </section>

            <section className="mt-8">
                <h2 className="mb-4 text-lg font-bold text-[#1B2B4B]">Demandes récentes</h2>
                <RecentDemandesTable />
            </section>
        </main>
    )
}

function RecentDemandesTable() {
    const [demandes, setDemandes] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        let mounted = true
            ; (async () => {
                try {
                    const { api } = await import('@/lib/api')
                    const data = await api.getAllDemandes(6)
                    if (mounted) setDemandes(data)
                } catch (e) {
                    console.error(e)
                } finally {
                    if (mounted) setLoading(false)
                }
            })()
        return () => { mounted = false }
    }, [])

    return (
        <div className="overflow-hidden rounded-xl border bg-white"
            style={{ borderColor: 'rgba(3,23,61,0.1)' }}>
            <table className="w-full">
                <thead>
                    <tr style={{ backgroundColor: 'rgba(3,23,61,0.03)', borderBottom: '1px solid rgba(3,23,61,0.08)' }}>
                        {['ID', 'Étudiant', 'Filière', 'Type', 'Date', 'Actions'].map((h) => (
                            <th key={h}
                                className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider"
                                style={{ color: 'rgba(3,23,61,0.45)', textAlign: 'left' }}>
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <tr key={i}><td colSpan={6} className="px-5 py-6">Chargement...</td></tr>
                        ))
                    ) : demandes.length === 0 ? (
                        <tr><td colSpan={6} className="py-10 text-center">Aucune demande récente.</td></tr>
                    ) : (
                        demandes.map((d: any) => (
                            <tr key={d.id} className="group" style={{ borderBottom: '1px solid rgba(3,23,61,0.06)' }}>
                                <td className="px-5 py-4">
                                    <span className="text-[13px] font-semibold" style={{ color: 'var(--color-orange)' }}>
                                        {`#${d.id.slice(0, 8).toUpperCase()}`}
                                    </span>
                                </td>
                                <td className="px-5 py-4">
                                    <div className="text-[14px] font-medium" style={{ color: 'var(--color-navy)' }}>{d.etudiant?.name || '—'}</div>
                                </td>
                                <td className="px-5 py-4">
                                    <div className="text-[13px]" style={{ color: 'rgba(3,23,61,0.6)' }}>{d.etudiant?.filiere || '—'}</div>
                                </td>
                                <td className="px-5 py-4">
                                    <div className="text-[14px] font-medium" style={{ color: 'var(--color-navy)' }}>{typeDocumentLabel[d.typeDocument] ?? d.typeDocument}</div>
                                </td>
                                <td className="px-5 py-4">
                                    <div className="text-[13px]" style={{ color: 'rgba(3,23,61,0.6)' }}>{format(new Date(d.createdAt), 'd MMM yyyy', { locale: fr })}</div>
                                </td>
                                <td className="px-5 py-4">
                                    <div className="flex items-center justify-end gap-2">
                                        {d.document?.id ? (
                                            <>
                                                <Link
                                                    href={`/documents/${d.document.id}`}
                                                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-colors"
                                                    style={{ borderColor: 'rgba(3,23,61,0.12)', color: 'var(--color-navy)' }}
                                                    title="Voir"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                                <a
                                                    href={api.getDocumentDownloadUrl(d.document.id)}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-colors"
                                                    style={{ borderColor: 'rgba(3,23,61,0.12)', color: 'var(--color-orange)' }}
                                                    title="Télécharger"
                                                >
                                                    <Download className="h-4 w-4" />
                                                </a>
                                            </>
                                        ) : (
                                            <>
                                                <button type="button" disabled className="inline-flex h-9 w-9 items-center justify-center rounded-lg border" style={{ borderColor: 'rgba(3,23,61,0.10)', color: 'rgba(3,23,61,0.22)', backgroundColor: 'rgba(3,23,61,0.02)' }} title="Voir indisponible">
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <button type="button" disabled className="inline-flex h-9 w-9 items-center justify-center rounded-lg border" style={{ borderColor: 'rgba(3,23,61,0.10)', color: 'rgba(3,23,61,0.22)', backgroundColor: 'rgba(3,23,61,0.02)' }} title="Téléchargement indisponible">
                                                    <Download className="h-4 w-4" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    )
}
