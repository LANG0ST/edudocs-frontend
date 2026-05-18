'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronLeft, ChevronRight, Eye, Search } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

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

function TypeSelect({ value, onChange }: { value: string | null; onChange: (v: string | null) => void }) {
    const [open, setOpen] = useState(false)
    const current = typeOptions.find((opt) => opt.value === value) ?? typeOptions[0]

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

export default function UploadHistoryPage() {
    const [uploads, setUploads] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [typeFilter, setTypeFilter] = useState<string | null>(null)
    const [page, setPage] = useState(1)
    const [selectedUploadId, setSelectedUploadId] = useState<string | null>(null)
    const [unmatched, setUnmatched] = useState<any[]>([])
    const [assigning, setAssigning] = useState(false)
    const [assignStatus, setAssignStatus] = useState<string | null>(null)

    useEffect(() => { fetchUploads() }, [])
    useEffect(() => { setPage(1) }, [search, typeFilter])

    async function fetchUploads() {
        setLoading(true)
        try {
            const res = await fetch('/uploads', { credentials: 'include' })
            if (!res.ok) throw new Error('Failed to fetch uploads')
            const data = await res.json()
            setUploads(data)
        } catch (err: any) {
            setAssignStatus(`Error loading uploads: ${err.message}`)
        } finally {
            setLoading(false)
        }
    }

    async function fetchUnmatched(uploadId: string) {
        try {
            const res = await fetch(`/uploads/${uploadId}/unmatched`, { credentials: 'include' })
            if (!res.ok) {
                setUnmatched([])
                return
            }
            const data = await res.json()
            setUnmatched(data.unmatched || [])
        } catch (err: any) {
            setAssignStatus(`Error: ${err.message}`)
        }
    }

    function selectUpload(uploadId: string) {
        setSelectedUploadId(uploadId)
        setUnmatched([])
        setAssignStatus(null)
        fetchUnmatched(uploadId)
    }

    async function assignPage(pageNum: number) {
        const cne = prompt('Enter student CNE:')
        if (!cne) return

        setAssigning(true)
        setAssignStatus('Assigning...')

        const fd = new FormData()
        fd.append('page', pageNum.toString())
        fd.append('cne', cne)

        try {
            const res = await fetch(`/uploads/${selectedUploadId}/assign`, {
                method: 'POST',
                body: fd,
                credentials: 'include',
            })

            if (!res.ok) {
                const text = await res.text()
                setAssignStatus(`Assignment failed: ${res.status} ${text}`)
                return
            }

            const result = await res.json()
            setAssignStatus(`Page ${pageNum} assigned successfully (doc ${result.documentId})`)
            setUnmatched(unmatched.filter((p) => p.page !== pageNum))
        } catch (err: any) {
            setAssignStatus(`Error: ${err.message}`)
        } finally {
            setAssigning(false)
        }
    }

    const filtered = useMemo(() => {
        const term = search.toLowerCase()
        return uploads.filter((upload) => {
            const matchesType = !typeFilter || upload.typeDocument === typeFilter
            const matchesSearch = !term || [upload.id, upload.filiere, upload.anneeAcademique, upload.semestre, typeLabels[upload.typeDocument] ?? upload.typeDocument]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(term))
            return matchesType && matchesSearch
        })
    }, [uploads, search, typeFilter])

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

    if (loading) return <div className="p-6">Loading...</div>

    return (
        <div className="px-4 py-6 md:px-8 md:py-8">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="mt-1 text-[28px] font-bold leading-tight" style={{ color: 'var(--color-navy)' }}>Historique des uploads</h1>
                </div>
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
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Rechercher par ID, filière ou type..."
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
                            {['ID Upload', 'Type', 'Filière', 'Année', 'Date', 'Pages', 'Actions'].map((h) => (
                                <th key={h} className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider" style={{ color: 'rgba(3,23,61,0.45)' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {paginated.length === 0 ? (
                            <tr><td colSpan={7} className="py-16 text-center">Aucun upload trouvé.</td></tr>
                        ) : (
                            paginated.map((upload) => (
                                <tr key={upload.id} className="group" style={{ borderBottom: '1px solid rgba(3,23,61,0.06)' }}>
                                    <td className="px-5 py-4"><span className="text-[13px] font-semibold" style={{ color: 'var(--color-orange)' }}>{`#${upload.id.slice(0, 8).toUpperCase()}`}</span></td>
                                    <td className="px-5 py-4"><div className="text-[14px] font-medium" style={{ color: 'var(--color-navy)' }}>{typeLabels[upload.typeDocument] ?? upload.typeDocument}</div></td>
                                    <td className="px-5 py-4"><div className="text-[13px]" style={{ color: 'rgba(3,23,61,0.6)' }}>{upload.filiere}</div></td>
                                    <td className="px-5 py-4"><div className="text-[13px]" style={{ color: 'rgba(3,23,61,0.6)' }}>{upload.anneeAcademique}</div></td>
                                    <td className="px-5 py-4"><div className="text-[13px]" style={{ color: 'rgba(3,23,61,0.6)' }}>{format(new Date(upload.createdAt), 'd MMM yyyy', { locale: fr })}</div></td>
                                    <td className="px-5 py-4"><div className="text-[13px]" style={{ color: 'rgba(3,23,61,0.6)' }}>{upload.pagesTotal ? `${upload.pagesAssignees ?? 0}/${upload.pagesTotal}` : '—'}</div></td>
                                    <td className="px-5 py-4">
                                        <button type="button" onClick={() => selectUpload(upload.id)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-colors" style={{ borderColor: 'rgba(3,23,61,0.12)', color: 'var(--color-navy)' }} title="Voir les pages non associées">
                                            <Eye className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {!loading && filtered.length > 0 && (
                    <div className="flex items-center justify-between px-5 py-3.5" style={{ borderTop: '1px solid rgba(3,23,61,0.07)' }}>
                        <p className="text-[13px]" style={{ color: 'rgba(3,23,61,0.5)' }}>
                            Affichage de <span className="font-semibold" style={{ color: 'var(--color-navy)' }}>{Math.min(paginated.length, PAGE_SIZE)}</span> sur <span className="font-semibold" style={{ color: 'var(--color-navy)' }}>{filtered.length}</span> uploads
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

            {selectedUploadId && (
                <div className="mt-6 overflow-hidden rounded-xl border bg-white" style={{ borderColor: 'rgba(3,23,61,0.1)' }}>
                    <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(3,23,61,0.08)' }}>
                        <h2 className="text-[15px] font-semibold" style={{ color: 'var(--color-navy)' }}>Pages non associées</h2>
                        {assignStatus && <p className="text-[12px]" style={{ color: 'rgba(3,23,61,0.5)' }}>{assignStatus}</p>}
                    </div>
                    <div className="p-5">
                        {unmatched.length === 0 ? (
                            <p className="text-[13px]" style={{ color: 'rgba(3,23,61,0.45)' }}>Aucune page non associée pour cet upload.</p>
                        ) : (
                            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                {unmatched.map((page) => (
                                    <div key={page.page} className="rounded-lg border p-4" style={{ borderColor: 'rgba(3,23,61,0.08)' }}>
                                        <p className="text-[13px] font-semibold" style={{ color: 'var(--color-navy)' }}>Page {page.page}</p>
                                        {page.preview && <p className="mt-1 line-clamp-3 text-[12px]" style={{ color: 'rgba(3,23,61,0.45)' }}>{page.preview}</p>}
                                        <button type="button" disabled={assigning} onClick={() => assignPage(page.page)} className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-orange)] px-3 py-2 text-[12px] font-semibold text-white disabled:opacity-50">
                                            Assigner
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
