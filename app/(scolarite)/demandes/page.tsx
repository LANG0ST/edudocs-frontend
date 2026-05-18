'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { ChevronDown, ChevronLeft, ChevronRight, Download, Eye, FileText, Search } from 'lucide-react'
import { api } from '@/lib/api'

const PAGE_SIZE = 7

const typeLabels: Record<string, string> = {
    RELEVE_DE_NOTES: 'Relevé de notes',
    CERTIFICAT_SCOLARITE: 'Certificat de scolarité',
    ATTESTATION_INSCRIPTION: "Attestation d'inscription",
    ATTESTATION_REUSSITE: 'Attestation de réussite',
    ATTESTATION_CLASSEMENT: 'Attestation de classement',
    DIPLOME: 'Diplôme',
}

const typeOptions = [
    { value: null, label: 'Tous les types' },
    { value: 'RELEVE_DE_NOTES', label: 'Relevés de notes' },
    { value: 'CERTIFICAT_SCOLARITE', label: 'Certificats de scolarité' },
    { value: 'ATTESTATION_INSCRIPTION', label: "Attestations d'inscription" },
    { value: 'ATTESTATION_REUSSITE', label: 'Attestations de réussite' },
    { value: 'ATTESTATION_CLASSEMENT', label: 'Attestations de classement' },
    { value: 'DIPLOME', label: 'Diplômes' },
]

function TypeSelect({ value, onChange }: { value: string | null; onChange: (value: string | null) => void }) {
    const [open, setOpen] = useState(false)
    const current = typeOptions.find((option) => option.value === value) ?? typeOptions[0]

    return (
        <div className="relative">
            <button type="button" onClick={() => setOpen((o) => !o)} className="flex items-center gap-2 rounded-lg border-2 bg-white px-4 py-2.5 text-[13px] font-medium transition-colors" style={{ borderColor: open ? 'var(--color-orange)' : 'rgba(3,23,61,0.12)', color: 'var(--color-navy)', minWidth: 190 }}>
                <span className="flex-1 text-left">{current.label}</span>
                <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}><ChevronDown className="h-4 w-4 opacity-50" /></motion.span>
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }} className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border bg-white shadow-lg" style={{ borderColor: 'rgba(3,23,61,0.1)' }}>
                        {typeOptions.map((option) => (
                            <button key={option.label} type="button" onClick={() => { onChange(option.value); setOpen(false) }} className="flex w-full items-center px-4 py-2.5 text-[13px] transition-colors hover:bg-[rgba(181,103,26,0.07)]" style={{ color: option.value === value ? 'var(--color-orange)' : 'var(--color-navy)', fontWeight: option.value === value ? 600 : 400 }}>
                                {option.label}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

function shortId(id: string) {
    return `${id.slice(0, 9).toUpperCase()}`
}

export default function ScolariteDemandesPage() {
    const router = useRouter()
    const [demandes, setDemandes] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [typeFilter, setTypeFilter] = useState<string | null>(null)
    const [page, setPage] = useState(1)

    useEffect(() => {
        const fetchDemandes = async () => {
            try {
                const data = await api.getAllDemandes()
                setDemandes(data)
            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        }

        fetchDemandes()
    }, [])

    useEffect(() => {
        setPage(1)
    }, [search, typeFilter])

    const filtered = useMemo(() => {
        const term = search.toLowerCase()
        return demandes.filter((d) => {
            const matchesType = !typeFilter || d.typeDocument === typeFilter
            const matchesSearch = !term || [d.id, d.etudiant?.name, d.etudiant?.filiere, d.motif, typeLabels[d.typeDocument] ?? d.typeDocument]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(term))
            return matchesType && matchesSearch
        })
    }, [demandes, search, typeFilter])

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

    return (
        <div className="px-4 py-6 md:px-8 md:py-8">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="mt-1 text-[28px] font-bold leading-tight" style={{ color: 'var(--color-navy)' }}>Demandes</h1>
                </div>
                <motion.button type="button" onClick={() => router.push('/upload')} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} className="flex shrink-0 items-center gap-2 rounded-lg px-5 py-2.5 text-[13px] font-semibold text-white" style={{ backgroundColor: 'var(--color-orange)' }}>
                    <FileText className="h-4 w-4" />
                    Upload PDF
                </motion.button>
            </div>

            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <div>
                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(3,23,61,0.4)' }}>Type</p>
                    <TypeSelect value={typeFilter} onChange={setTypeFilter} />
                </div>
                <div className="flex-1 sm:mt-5">
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 opacity-35" style={{ color: 'var(--color-navy)' }} />
                        <input
                            type="text"
                            placeholder="Rechercher par ID, étudiant, filière ou type..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-lg border-2 bg-white py-2.5 pl-10 pr-4 text-[13px] outline-none transition-colors"
                            style={{ borderColor: search ? 'var(--color-orange)' : 'rgba(3,23,61,0.12)', color: 'var(--color-navy)' }}
                        />
                    </div>
                </div>
            </div>

            <div className="overflow-hidden rounded-xl border bg-white" style={{ borderColor: 'rgba(3,23,61,0.1)' }}>
                <table className="w-full">
                    <thead>
                        <tr style={{ backgroundColor: 'rgba(3,23,61,0.03)', borderBottom: '1px solid rgba(3,23,61,0.08)' }}>
                            {['ID', 'Étudiant', 'Filière', 'Type', 'Date', 'Actions'].map((h) => (
                                <th key={h} className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider" style={{ color: 'rgba(3,23,61,0.45)' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => <tr key={i}><td colSpan={6} className="px-5 py-6">Chargement...</td></tr>)
                        ) : paginated.length === 0 ? (
                            <tr><td colSpan={6} className="py-16 text-center">Aucune demande trouvée.</td></tr>
                        ) : (
                            paginated.map((d, idx) => (
                                <tr key={d.id} className="group" style={{ borderBottom: '1px solid rgba(3,23,61,0.06)' }}>
                                    <td className="px-5 py-4"><span className="text-[13px] font-semibold" style={{ color: 'var(--color-orange)' }}>{shortId(d.id)}</span></td>
                                    <td className="px-5 py-4"><div className="text-[14px] font-medium" style={{ color: 'var(--color-navy)' }}>{d.etudiant?.name || '—'}</div></td>
                                    <td className="px-5 py-4"><div className="text-[13px]" style={{ color: 'rgba(3,23,61,0.6)' }}>{d.etudiant?.filiere || '—'}</div></td>
                                    <td className="px-5 py-4"><div className="text-[13px] font-medium" style={{ color: 'var(--color-navy)' }}>{typeLabels[d.typeDocument] ?? d.typeDocument}</div></td>
                                    <td className="px-5 py-4"><div className="text-[13px]" style={{ color: 'rgba(3,23,61,0.6)' }}>{format(new Date(d.createdAt), 'd MMM yyyy', { locale: fr })}</div></td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            {d.document?.id ? (
                                                <>
                                                    <Link href={`/documents/${d.document.id}`} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-colors" style={{ borderColor: 'rgba(3,23,61,0.12)', color: 'var(--color-navy)' }} title="Voir">
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                    <a href={api.getDocumentDownloadUrl(d.document.id)} target="_blank" rel="noreferrer" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-colors" style={{ borderColor: 'rgba(3,23,61,0.12)', color: 'var(--color-orange)' }} title="Télécharger">
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

                {!loading && filtered.length > 0 && (
                    <div className="flex items-center justify-between px-5 py-3.5" style={{ borderTop: '1px solid rgba(3,23,61,0.07)' }}>
                        <p className="text-[13px]" style={{ color: 'rgba(3,23,61,0.5)' }}>
                            Affichage de <span className="font-semibold" style={{ color: 'var(--color-navy)' }}>{Math.min(paginated.length, PAGE_SIZE)}</span> sur <span className="font-semibold" style={{ color: 'var(--color-navy)' }}>{filtered.length}</span> demandes
                        </p>
                        <div className="flex items-center gap-1">
                            <motion.button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} whileTap={page > 1 ? { scale: 0.93 } : {}} className="flex h-8 w-8 items-center justify-center rounded-lg border" style={{ borderColor: 'rgba(3,23,61,0.12)', color: page === 1 ? 'rgba(3,23,61,0.2)' : 'var(--color-navy)' }}><ChevronLeft className="h-4 w-4" /></motion.button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                <motion.button key={p} type="button" onClick={() => setPage(p)} whileTap={{ scale: 0.93 }} className="flex h-8 w-8 items-center justify-center rounded-lg border text-[13px] font-medium" style={{ borderColor: p === page ? 'var(--color-navy)' : 'rgba(3,23,61,0.12)', backgroundColor: p === page ? 'var(--color-navy)' : 'transparent', color: p === page ? '#fff' : 'var(--color-navy)' }}>{p}</motion.button>
                            ))}
                            <motion.button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} whileTap={page < totalPages ? { scale: 0.93 } : {}} className="flex h-8 w-8 items-center justify-center rounded-lg border" style={{ borderColor: 'rgba(3,23,61,0.12)', color: page === totalPages ? 'rgba(3,23,61,0.2)' : 'var(--color-navy)' }}><ChevronRight className="h-4 w-4" /></motion.button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
