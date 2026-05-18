'use client'

import { useEffect, useState, useMemo } from 'react'
import { useSession } from '@/lib/auth-client'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  Eye, FileText, Plus, Search, Download,
  GraduationCap, ClipboardCheck, BookOpen, Award, BarChart2,
  ShieldCheck, ShieldOff,
} from 'lucide-react'
import { api, type DocumentSummary } from '@/lib/api'

const typeDocumentLabel: Record<string, string> = {
  RELEVE_DE_NOTES: 'Relevé de notes',
  CERTIFICAT_SCOLARITE: 'Certificat de scolarité',
  ATTESTATION_INSCRIPTION: "Attestation d'inscription",
  ATTESTATION_REUSSITE: 'Attestation de réussite',
  ATTESTATION_CLASSEMENT: 'Attestation de classement',
  DIPLOME: 'Diplôme fin d\'études',
}

const typeIcons: Record<string, React.ElementType> = {
  DIPLOME: GraduationCap,
  CERTIFICAT_SCOLARITE: FileText,
  ATTESTATION_INSCRIPTION: ClipboardCheck,
  RELEVE_DE_NOTES: BookOpen,
  ATTESTATION_REUSSITE: Award,
  ATTESTATION_CLASSEMENT: BarChart2,
}

const categories = [
  { value: 'ALL', label: 'Tous' },
  { value: 'DIPLOME', label: 'Diplômes' },
  { value: 'RELEVE_DE_NOTES', label: 'Relevés de notes' },
  { value: 'ATTESTATION', label: 'Attestations' },
]

function matchesCategory(doc: DocumentSummary, cat: string) {
  if (cat === 'ALL') return true
  if (cat === 'ATTESTATION') return doc.typeDocument.startsWith('ATTESTATION_')
  return doc.typeDocument === cat
}

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-xl border bg-white" style={{ borderColor: 'rgba(3,23,61,0.1)' }}>
      <div className="h-36 animate-pulse" style={{ backgroundColor: 'rgba(3,23,61,0.05)' }} />
      <div className="p-5 space-y-3">
        <div className="h-4 w-2/3 animate-pulse rounded" style={{ backgroundColor: 'rgba(3,23,61,0.07)' }} />
        <div className="h-3 w-1/2 animate-pulse rounded" style={{ backgroundColor: 'rgba(3,23,61,0.05)' }} />
        <div className="h-3 w-3/4 animate-pulse rounded" style={{ backgroundColor: 'rgba(3,23,61,0.05)' }} />
      </div>
    </div>
  )
}

function DocCard({ doc }: { doc: DocumentSummary }) {
  const Icon = typeIcons[doc.typeDocument] ?? FileText
  const label = typeDocumentLabel[doc.typeDocument] ?? doc.typeDocument
  const isActive = doc.statut === 'ACTIF'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, boxShadow: '0 12px 32px rgba(3,23,61,0.1)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className="overflow-hidden rounded-xl border bg-white flex flex-col"
      style={{ borderColor: 'rgba(3,23,61,0.1)' }}
    >
      {/* Card header — navy bg with icon */}
      <div className="relative flex items-start justify-between p-5 pb-10"
        style={{ backgroundColor: 'var(--color-navy)' }}>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest"
            style={{ color: 'rgba(255,255,255,0.5)' }}>
            {doc.typeDocument === 'DIPLOME' ? "Diplôme d'état" : 'Document académique'}
          </p>
          <h3 className="mt-1 text-[17px] font-bold text-white leading-tight">{label}</h3>
          {(doc.anneeAcademique || doc.semestre) && (
            <p className="mt-0.5 text-[12px]" style={{ color: 'rgba(255,255,255,0.55)' }}>
              {doc.anneeAcademique || ''}
              {doc.semestre ? ` · ${doc.semestre}` : ''}
            </p>
          )}
        </div>

        {/* Status badge */}
        <span
          className="flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
          style={{
            backgroundColor: isActive ? 'rgba(16,141,106,0.18)' : 'rgba(253,75,108,0.18)',
            color: isActive ? '#6ee7b7' : '#fca5a5',
          }}
        >
          {isActive
            ? <ShieldCheck className="h-3 w-3" />
            : <ShieldOff className="h-3 w-3" />}
          {isActive ? 'Actif' : 'Révoqué'}
        </span>
      </div>

      {/* Icon bubble overlapping header/body */}
      <div className="relative px-5">
        <div
          className="-mt-6 flex h-12 w-12 items-center justify-center rounded-xl shadow-md"
          style={{ backgroundColor: 'var(--color-orange)' }}
        >
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5 pt-3">
        {/* Preview area */}
        <div
          className="mb-4 flex h-28 items-center justify-center rounded-lg"
          style={{ backgroundColor: 'rgba(3,23,61,0.03)', border: '1px dashed rgba(3,23,61,0.12)' }}
        >
          <div className="text-center">
            <p className="text-[12px] font-medium" style={{ color: 'rgba(3,23,61,0.45)' }}>Aperçu du document</p>
            <p className="mt-0.5 text-[11px]" style={{ color: 'rgba(3,23,61,0.3)' }}>{doc.statutBlockchain}</p>
          </div>
        </div>

        {/* Meta rows */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[12px]" style={{ color: 'rgba(3,23,61,0.5)' }}>Émis le</span>
            <span className="text-[12px] font-semibold" style={{ color: 'var(--color-navy)' }}>
              {format(new Date(doc.emissLe), 'd MMM yyyy', { locale: fr })}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[12px]" style={{ color: 'rgba(3,23,61,0.5)' }}>Code de vérification</span>
            <span className="font-mono text-[11px] font-semibold" style={{ color: 'var(--color-navy)' }}>
              {doc.codeVerification}
            </span>
          </div>
        </div>

        {/* Separator */}
        <div className="my-4 h-px" style={{ backgroundColor: 'rgba(3,23,61,0.07)' }} />

        {/* Actions */}
        <div className="flex gap-2">
          <Link
            href={`/portfolio/${doc.id}`}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-[13px] font-semibold text-white transition-colors"
            style={{ backgroundColor: 'var(--color-navy)' }}
          >
            <Eye className="h-4 w-4" />
            Aperçu
          </Link>

          <a
            href={api.getDocumentDownloadUrl(doc.id)}
            target="_blank"
            rel="noreferrer"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-2 transition-colors"
            style={{ borderColor: 'rgba(3,23,61,0.12)', color: 'var(--color-orange)' }}
            title="Télécharger"
          >
            <Download className="h-4 w-4" />
          </a>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function PortfolioPage() {
  const session = useSession()
  const [documents, setDocuments] = useState<DocumentSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('ALL')

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await api.getMonPortfolio()
        setDocuments(data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    if (session?.data?.user) fetch()
  }, [session])

  const filtered = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch =
        !search ||
        (typeDocumentLabel[doc.typeDocument] ?? doc.typeDocument).toLowerCase().includes(search.toLowerCase()) ||
        doc.codeVerification.toLowerCase().includes(search.toLowerCase()) ||
        `${doc.anneeAcademique ?? ''} ${doc.semestre ?? ''}`.toLowerCase().includes(search.toLowerCase())
      return matchesSearch && matchesCategory(doc, category)
    })
  }, [documents, search, category])

  return (
    <div className="px-6 py-8 md:px-8 md:py-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>

          <h1 className="mt-1 text-[28px] font-bold leading-tight" style={{ color: 'var(--color-navy)' }}>
            Mes Documents
          </h1>
        </div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
          <Link
            href="/demande/nouvelle"
            className="flex shrink-0 items-center gap-2 rounded-lg px-5 py-2.5 text-[13px] font-semibold text-white"
            style={{ backgroundColor: 'var(--color-orange)' }}
          >
            <Plus className="h-4 w-4" />
            Nouveau document
          </Link>
        </motion.div>
      </div>

      {/* ── Filters ── */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 opacity-35"
            style={{ color: 'var(--color-navy)' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un document..."
            className="w-full rounded-lg border-2 bg-white py-2.5 pl-10 pr-4 text-[13px] outline-none transition-colors"
            style={{
              borderColor: search ? 'var(--color-orange)' : 'rgba(3,23,61,0.12)',
              color: 'var(--color-navy)',
            }}
          />
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
          {categories.map((cat) => (
            <motion.button
              key={cat.value}
              type="button"
              onClick={() => setCategory(cat.value)}
              whileTap={{ scale: 0.95 }}
              className="shrink-0 whitespace-nowrap rounded-lg border-2 px-3 py-2 text-[12px] font-medium transition-colors sm:px-4 sm:text-[13px]"
              style={{
                backgroundColor: category === cat.value ? 'var(--color-navy)' : 'white',
                borderColor: category === cat.value ? 'var(--color-navy)' : 'rgba(3,23,61,0.12)',
                color: category === cat.value ? '#fff' : 'var(--color-navy)',
              }}
            >
              {cat.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* ── Grid ── */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-24 text-center"
          style={{ borderColor: 'rgba(3,23,61,0.12)' }}
        >
          <FileText className="mb-3 h-10 w-10 opacity-20" style={{ color: 'var(--color-navy)' }} />
          <p className="text-[14px] font-medium" style={{ color: 'rgba(3,23,61,0.5)' }}>
            Aucun document disponible pour le moment.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence>
            {filtered.map((doc, i) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ delay: i * 0.05 }}
              >
                <DocCard doc={doc} />
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Add new card */}
          <motion.div
            whileHover={{ y: -3, boxShadow: '0 12px 32px rgba(3,23,61,0.08)' }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className="overflow-hidden rounded-xl border-2 border-dashed bg-white"
            style={{ borderColor: 'rgba(3,23,61,0.12)' }}
          >
            <Link
              href="/demande/nouvelle"
              className="flex h-full min-h-[320px] flex-col items-center justify-center gap-4 p-6 text-center"
            >
              <div
                className="flex h-14 w-14 items-center justify-center rounded-xl"
                style={{ backgroundColor: 'rgba(3,23,61,0.05)', border: '2px dashed rgba(3,23,61,0.15)' }}
              >
                <Plus className="h-6 w-6" style={{ color: 'rgba(3,23,61,0.35)' }} />
              </div>
              <div>
                <h3 className="text-[16px] font-semibold" style={{ color: 'var(--color-navy)' }}>
                  Nouveau document
                </h3>
                <p className="mt-1 max-w-[180px] text-[13px]" style={{ color: 'rgba(3,23,61,0.45)' }}>
                  Demandez une nouvelle attestation ou un diplôme.
                </p>
              </div>
            </Link>
          </motion.div>
        </div>
      )}
    </div>
  )
}