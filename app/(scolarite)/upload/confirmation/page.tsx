"use client"

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Upload, X, FileText } from 'lucide-react'
import { api } from '@/lib/api'

type Mode = 'EN_MASSE' | 'PAR_ETUDIANT'

const MODES: { value: Mode; label: string }[] = [
    { value: 'EN_MASSE', label: 'En masse' },
    { value: 'PAR_ETUDIANT', label: 'Par étudiant' },
]

function StudentSelect({
    filiere,
    onSelect,
}: {
    filiere: string
    onSelect: (id: string) => void
}) {
    const [students, setStudents] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [selectedId, setSelectedId] = useState('')

    useEffect(() => {
        if (!filiere) {
            setStudents([])
            return
        }
        let cancelled = false
        async function fetchStudents() {
            setLoading(true)
            setError(null)
            try {
                const data = await api.getStudents(`filiere:${filiere}`)
                if (!cancelled) setStudents(Array.isArray(data) ? data : [])
            } catch (e: any) {
                if (!cancelled) {
                    console.error('Error fetching students:', e)
                    setError('Impossible de charger les étudiants.')
                    setStudents([])
                }
            } finally {
                if (!cancelled) setLoading(false)
            }
        }
        fetchStudents()
        return () => { cancelled = true }
    }, [filiere])

    function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
        setSelectedId(e.target.value)
        onSelect(e.target.value)
    }

    const placeholder = loading
        ? 'Chargement...'
        : error
            ? error
            : students.length === 0
                ? 'Aucun étudiant trouvé'
                : 'Sélectionner un étudiant'

    return (
        <div>
            <label
                className="mb-2 block text-[11px] sm:text-[12px] font-semibold uppercase tracking-wider"
                style={{ color: 'rgba(3,23,61,0.5)' }}
            >
                Étudiant
            </label>
            <select
                value={selectedId}
                onChange={handleChange}
                disabled={loading || students.length === 0}
                className="w-full rounded-lg border-2 bg-white px-3 sm:px-4 py-2 sm:py-2.5 text-[13px] sm:text-[14px] transition-colors outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                    borderColor: 'rgba(3,23,61,0.12)',
                    color: selectedId ? 'var(--color-navy)' : 'rgba(3,23,61,0.4)',
                }}
            >
                <option value="">{placeholder}</option>
                {students.map((s) => (
                    <option key={s.id} value={s.id}>
                        {s.name} ({s.cne})
                    </option>
                ))}
            </select>
        </div>
    )
}

// ─── DragAndDropUpload ─────────────────────────────────────────────────────────
function DragAndDropUpload({
    file,
    setFile,
    disabled,
}: {
    file: File | null
    setFile: (f: File | null) => void
    disabled?: boolean
}) {
    const [isDragging, setIsDragging] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    function handleDrop(e: React.DragEvent) {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)
        const dropped = e.dataTransfer.files[0]
        if (dropped?.type === 'application/pdf') setFile(dropped)
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const selected = e.target.files?.[0]
        if (selected?.type === 'application/pdf') setFile(selected)
        // reset so re-selecting the same file triggers onChange again
        e.target.value = ''
    }

    if (file) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                className="rounded-lg border-2 p-4 sm:p-5 bg-[rgba(181,103,26,0.06)]"
                style={{ borderColor: 'var(--color-orange)' }}
            >
                <div className="flex items-start justify-between gap-2 sm:gap-3">
                    <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                        <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-lg bg-[var(--color-orange)]">
                            <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p
                                className="text-[12px] sm:text-[13px] font-semibold truncate"
                                style={{ color: 'var(--color-navy)' }}
                            >
                                {file.name}
                            </p>
                            <p
                                className="text-[11px] sm:text-[12px] mt-1"
                                style={{ color: 'rgba(3,23,61,0.5)' }}
                            >
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => setFile(null)}
                        className="shrink-0 p-1 rounded hover:bg-white/60 transition-colors"
                        title="Supprimer"
                    >
                        <X className="h-4 w-4" style={{ color: 'var(--color-navy)' }} />
                    </button>
                </div>
            </motion.div>
        )
    }

    return (
        <>
            <input
                ref={inputRef}
                type="file"
                accept="application/pdf"
                onChange={handleChange}
                className="hidden"
            />
            <motion.button
                type="button"
                onClick={() => !disabled && inputRef.current?.click()}
                onDragEnter={() => !disabled && setIsDragging(true)}
                onDragLeave={() => setIsDragging(false)}
                onDrop={disabled ? undefined : handleDrop}
                onDragOver={(e) => e.preventDefault()}
                disabled={disabled}
                whileHover={!disabled ? { scale: 1.01 } : {}}
                whileTap={!disabled ? { scale: 0.99 } : {}}
                className="relative w-full rounded-lg border-2 border-dashed p-8 sm:p-10 lg:p-12 transition-all text-center disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                    borderColor: isDragging ? 'var(--color-orange)' : 'rgba(3,23,61,0.15)',
                    backgroundColor: isDragging ? 'rgba(181,103,26,0.05)' : 'rgba(3,23,61,0.01)',
                }}
            >
                <motion.div animate={{ y: isDragging ? -4 : 0 }} transition={{ duration: 0.2 }}>
                    <Upload
                        className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 opacity-40"
                        style={{ color: 'var(--color-navy)' }}
                    />
                    <p
                        className="text-[14px] sm:text-[15px] font-semibold"
                        style={{ color: 'var(--color-navy)' }}
                    >
                        Déposez votre PDF ici
                    </p>
                    <p
                        className="mt-1.5 text-[12px] sm:text-[13px]"
                        style={{ color: 'rgba(3,23,61,0.5)' }}
                    >
                        ou cliquez pour parcourir
                    </p>
                </motion.div>
            </motion.button>
        </>
    )
}

// ─── ConfirmationPage ──────────────────────────────────────────────────────────
export default function ConfirmationPage() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [mounted, setMounted] = useState(false)
    const [type, setType] = useState<string | null>(null)
    const [annee, setAnnee] = useState('')
    const [semestre, setSemestre] = useState('')
    const [filiere, setFiliere] = useState('')
    const [mode, setMode] = useState<Mode>('EN_MASSE')
    const [file, setFile] = useState<File | null>(null)
    const [studentId, setStudentId] = useState<string | null>(null)
    const [status, setStatus] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => { setMounted(true) }, [])

    useEffect(() => {
        if (!mounted) return
        const t = searchParams.get('type')
        if (!t) { router.push('/upload'); return }
        setType(t)
        setAnnee(searchParams.get('anneeAcademique') || '')
        setSemestre(searchParams.get('semestre') || '')
        setFiliere(searchParams.get('filiere') || '')
    }, [searchParams, router, mounted])

    function switchMode(next: Mode) {
        if (next === mode) return
        setMode(next)
        setFile(null)
        setStudentId(null)
        setStatus(null)
    }

    async function submitEnMasse(e: React.FormEvent) {
        e.preventDefault()
        if (!file) return setStatus('Veuillez sélectionner un fichier PDF.')
        setIsSubmitting(true)
        setStatus('Upload en cours...')
        try {
            const fd = new FormData()
            fd.append('file', file)
            fd.append('typeDocument', type ?? '')
            fd.append('anneeAcademique', annee)
            fd.append('filiere', filiere)
            if (semestre) fd.append('semestre', semestre)

            const res = await fetch('/uploads/masse', { method: 'POST', body: fd, credentials: 'include' })
            if (!res.ok) throw new Error(await res.text())
            setStatus('Upload accepté — redirection...')
            setTimeout(() => router.push('/upload-history'), 1500)
        } catch (err: any) {
            setStatus(`Erreur : ${err?.message ?? err}`)
            setIsSubmitting(false)
        }
    }

    async function submitParEtudiant(e: React.FormEvent) {
        e.preventDefault()
        if (!file || !studentId) return setStatus('Sélectionnez un étudiant et un fichier.')
        setIsSubmitting(true)
        setStatus('Assignation en cours...')
        try {
            const createRes = await fetch('/uploads/create', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filiere, anneeAcademique: annee, semestre, typeDocument: type }),
            })
            if (!createRes.ok) throw new Error(await createRes.text())
            const { id } = await createRes.json()

            const fd = new FormData()
            fd.append('file', file)
            fd.append('studentId', studentId)

            const assignRes = await fetch(`/uploads/${id}/assign`, { method: 'POST', body: fd, credentials: 'include' })
            if (!assignRes.ok) throw new Error(await assignRes.text())

            setStatus('Assignation réussie — redirection...')
            setTimeout(() => router.push('/upload-history'), 1500)
        } catch (err: any) {
            setStatus(`Erreur : ${err?.message ?? err}`)
            setIsSubmitting(false)
        }
    }

    if (!mounted) return null

    const canSubmit = !!file && (mode === 'EN_MASSE' || !!studentId)

    return (
        <div className="flex min-h-screen items-center justify-center px-3 py-6 sm:px-4 sm:py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="w-full max-w-[750px]"
            >
                {/* Header */}
                <div className="mb-8 sm:mb-10 flex flex-col items-center text-center">
                    <div className="relative h-12 w-12 mb-4 sm:h-14 sm:w-14">
                        <Image src="/images/logo.png" alt="EduDocs" fill sizes="56px" className="object-contain" />
                    </div>
                    <h1
                        className="text-[24px] sm:text-[28px] font-bold leading-tight"
                        style={{ color: 'var(--color-navy)' }}
                    >
                        Upload de Documents
                    </h1>
                    <p
                        className="mt-2 text-[13px] sm:text-[14px] leading-relaxed"
                        style={{ color: 'rgba(3,23,61,0.52)' }}
                    >
                        Étape 3 : Choisissez le mode d'upload et téléversez votre PDF
                    </p>
                </div>

                <motion.div
                    className="rounded-2xl border bg-white p-6 sm:p-8"
                    style={{ borderColor: 'rgba(3,23,61,0.08)' }}
                >
                    {/* ── Mode toggle ── */}
                    <div
                        className="mb-7 sm:mb-8 flex flex-col sm:flex-row items-stretch gap-2 rounded-lg p-1"
                        style={{ backgroundColor: 'rgba(3,23,61,0.03)' }}
                    >
                        {MODES.map(({ value, label }) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => switchMode(value)}
                                className="flex-1 rounded-lg px-4 sm:px-5 py-2 sm:py-2.5 text-[12px] sm:text-[13px] font-semibold transition-all"
                                style={{
                                    color: mode === value ? '#fff' : 'rgba(3,23,61,0.6)',
                                    backgroundColor: mode === value ? 'var(--color-orange)' : 'transparent',
                                }}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* ── Form ── */}
                    <form
                        onSubmit={mode === 'EN_MASSE' ? submitEnMasse : submitParEtudiant}
                        className="space-y-6 sm:space-y-7"
                    >
                        <AnimatePresence mode="wait">
                            {mode === 'PAR_ETUDIANT' && (
                                <motion.div
                                    key="student-select"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <StudentSelect filiere={filiere} onSelect={setStudentId} />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div>
                            <label
                                className="mb-3 block text-[11px] sm:text-[12px] font-semibold uppercase tracking-wider"
                                style={{ color: 'rgba(3,23,61,0.5)' }}
                            >
                                Fichier PDF
                            </label>
                            <DragAndDropUpload
                                file={file}
                                setFile={setFile}
                                disabled={mode === 'PAR_ETUDIANT' && !studentId}
                            />
                        </div>

                        {status && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="rounded-lg p-3 sm:p-3 text-[12px] sm:text-[13px]"
                                style={{
                                    backgroundColor: 'rgba(181,103,26,0.08)',
                                    color: status.startsWith('Erreur') ? '#d32f2f' : 'var(--color-orange)',
                                }}
                            >
                                {status}
                            </motion.div>
                        )}

                        <div className="flex flex-col-reverse gap-2 sm:gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                            <motion.button
                                type="button"
                                onClick={() => router.back()}
                                whileHover={{ x: -2 }}
                                whileTap={{ scale: 0.97 }}
                                className="flex items-center justify-center gap-2 rounded-lg border px-5 py-2 sm:py-2 text-[12px] sm:text-[13px] font-medium"
                                style={{ color: 'var(--color-navy)', borderColor: 'rgba(3,23,61,0.15)' }}
                            >
                                <ChevronLeft className="h-4 w-4" /> Retour
                            </motion.button>

                            <motion.button
                                type="submit"
                                disabled={isSubmitting || !canSubmit}
                                whileHover={!isSubmitting && canSubmit ? { x: 2 } : {}}
                                whileTap={!isSubmitting && canSubmit ? { scale: 0.97 } : {}}
                                className="flex items-center justify-center gap-2 rounded-lg px-6 sm:px-6 py-2 sm:py-2 text-[12px] sm:text-[13px] font-semibold text-white transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ backgroundColor: 'var(--color-orange)' }}
                            >
                                {isSubmitting ? 'Envoi...' : 'Envoyer'}
                                <ChevronRight className="h-4 w-4" />
                            </motion.button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </div>
    )
}