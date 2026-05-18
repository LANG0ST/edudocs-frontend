'use client'

import { useEffect, useState, useMemo } from 'react'
import { useSession } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  Search, ChevronDown, Eye, Download, RefreshCw,
  FilePlus2, ChevronLeft, ChevronRight, FileX,
} from 'lucide-react'
import { api } from '@/lib/api'

interface Demande {
  id: string
  typeDocument: string
  statut: 'EN_ATTENTE' | 'EN_TRAITEMENT' | 'TERMINE' | 'REJETE'
  createdAt: string
  motif: string
}

const typeDocumentLabel: Record<string, string> = {
  RELEVE_DE_NOTES: 'Relevé de notes',
  CERTIFICAT_SCOLARITE: 'Certificat de scolarité',
  ATTESTATION_INSCRIPTION: "Attestation d'inscription",
  ATTESTATION_REUSSITE: 'Attestation de réussite',
  ATTESTATION_CLASSEMENT: 'Attestation de classement',
  DIPLOME: 'Diplôme',
}

const statutConfig: Record<string, { label: string; color: string; bg: string; dot?: boolean }> = {
  EN_ATTENTE:    { label: 'En attente',    color: '#b45309', bg: 'rgba(180,83,9,0.1)',    dot: true },
  EN_TRAITEMENT: { label: 'En traitement', color: '#6d28d9', bg: 'rgba(109,40,217,0.1)', dot: true },
  TERMINE:       { label: 'Terminée',      color: '#065f46', bg: 'rgba(6,95,70,0.1)' },
  REJETE:        { label: 'Rejetée',       color: '#991b1b', bg: 'rgba(153,27,27,0.1)' },
}

const statutOptions = [
  { value: null,           label: 'Tous les statuts' },
  { value: 'EN_ATTENTE',   label: 'En attente' },
  { value: 'EN_TRAITEMENT',label: 'En traitement' },
  { value: 'TERMINE',      label: 'Terminée' },
  { value: 'REJETE',       label: 'Rejetée' },
]

const PAGE_SIZE = 7

function shortId(id: string) {
  return `#${id.slice(0, 8).toUpperCase()}`
}

function StatusBadge({ statut }: { statut: string }) {
  const cfg = statutConfig[statut] ?? { label: statut, color: '#6b7280', bg: 'rgba(107,114,128,0.1)' }
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-semibold"
      style={{ color: cfg.color, backgroundColor: cfg.bg }}
    >
      {cfg.dot && (
        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: cfg.color }} />
      )}
      {cfg.label}
    </span>
  )
}

function FilterSelect({
  value, options, onChange,
}: {
  value: string | null
  options: { value: string | null; label: string }[]
  onChange: (v: string | null) => void
}) {
  const [open, setOpen] = useState(false)
  const current = options.find((o) => o.value === value) ?? options[0]

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg border-2 bg-white px-4 py-2.5 text-[13px] font-medium transition-colors"
        style={{
          borderColor: open ? 'var(--color-orange)' : 'rgba(3,23,61,0.12)',
          color: 'var(--color-navy)',
          minWidth: 160,
        }}
      >
        <span className="flex-1 text-left">{current.label}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}
            className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border bg-white shadow-lg"
            style={{ borderColor: 'rgba(3,23,61,0.1)' }}
          >
            {options.map((opt) => (
              <button
                key={opt.label} type="button"
                onClick={() => { onChange(opt.value); setOpen(false) }}
                className="flex w-full items-center px-4 py-2.5 text-[13px] transition-colors hover:bg-[rgba(181,103,26,0.07)]"
                style={{
                  color: opt.value === value ? 'var(--color-orange)' : 'var(--color-navy)',
                  fontWeight: opt.value === value ? 600 : 400,
                }}
              >
                {opt.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function SkeletonRow() {
  return (
    <tr>
      {[100, 160, 120, 100, 80].map((w, i) => (
        <td key={i} className="px-5 py-4">
          <div className="h-4 animate-pulse rounded" style={{ width: w, backgroundColor: 'rgba(3,23,61,0.07)' }} />
        </td>
      ))}
    </tr>
  )
}

export default function MesDemandesPage() {
  const session = useSession()
  const router = useRouter()
  const [demandes, setDemandes] = useState<Demande[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await api.getMesDemandes()
        setDemandes(data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    if (session?.data?.user) fetch()
  }, [session])

  useEffect(() => { setPage(1) }, [filter, search])

  const filtered = useMemo(() => {
    return demandes.filter((d) => {
      const matchesFilter = !filter || d.statut === filter
      const term = search.toLowerCase()
      const matchesSearch =
        !term ||
        shortId(d.id).toLowerCase().includes(term) ||
        (typeDocumentLabel[d.typeDocument] ?? d.typeDocument).toLowerCase().includes(term) ||
        d.motif.toLowerCase().includes(term)
      return matchesFilter && matchesSearch
    })
  }, [demandes, filter, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="px-6 py-8 md:px-8 md:py-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="mt-1 text-[28px] font-bold leading-tight" style={{ color: 'var(--color-navy)' }}>
            Historique des Demandes
          </h1>
        </div>

        <motion.button
          type="button"
          onClick={() => router.push('/demande/nouvelle')}
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          className="flex shrink-0 items-center gap-2 rounded-lg px-5 py-2.5 text-[13px] font-semibold text-white"
          style={{ backgroundColor: 'var(--color-orange)' }}
        >
          <FilePlus2 className="h-4 w-4" />
          Nouvelle demande
        </motion.button>
      </div>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div>
          <FilterSelect value={filter} options={statutOptions} onChange={setFilter} />
        </div>

        <div className="mb-5 flex-1 sm:mt-5">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 opacity-35"
              style={{ color: 'var(--color-navy)' }} />
            <input
              type="text"
              placeholder="Rechercher par ID ou type de document..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border-2 bg-white py-2.5 pl-10 pr-4 text-[13px] outline-none transition-colors"
              style={{
                borderColor: search ? 'var(--color-orange)' : 'rgba(3,23,61,0.12)',
                color: 'var(--color-navy)',
              }}
            />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white"
        style={{ borderColor: 'rgba(3,23,61,0.1)' }}>
        <table className="w-full">
          <thead>
            <tr style={{ backgroundColor: 'rgba(3,23,61,0.03)', borderBottom: '1px solid rgba(3,23,61,0.08)' }}>
              {['ID Demande', 'Type de Document', 'Date de Soumission', 'Statut', 'Actions'].map((h, i) => (
                <th key={h}
                  className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider"
                  style={{ color: 'rgba(3,23,61,0.45)', textAlign: i === 4 ? 'right' : 'left' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-20 text-center">
                  <FileX className="mx-auto mb-3 h-10 w-10 opacity-20" style={{ color: 'var(--color-navy)' }} />
                  <p className="text-[14px]" style={{ color: 'rgba(3,23,61,0.45)' }}>
                    Aucune demande trouvée.
                  </p>
                </td>
              </tr>
            ) : (
              paginated.map((d, idx) => (
                <motion.tr
                  key={d.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="group transition-colors"
                  style={{ borderBottom: '1px solid rgba(3,23,61,0.06)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(3,23,61,0.02)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <td className="px-5 py-4">
                    <span className="text-[13px] font-semibold" style={{ color: 'var(--color-orange)' }}>
                      {shortId(d.id)}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <span className="text-[14px] font-medium" style={{ color: 'var(--color-navy)' }}>
                      {typeDocumentLabel[d.typeDocument] ?? d.typeDocument}
                    </span>
                    <p className="mt-0.5 text-[12px]" style={{ color: 'rgba(3,23,61,0.45)' }}>
                      {d.motif}
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    <span className="text-[13px]" style={{ color: 'rgba(3,23,61,0.6)' }}>
                      {format(new Date(d.createdAt), 'd MMM yyyy, HH:mm', { locale: fr })}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <StatusBadge statut={d.statut} />
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {d.statut === 'REJETE' && (
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                          onClick={() => router.push(`/demande/nouvelle/resume?type=${d.typeDocument}`)}
                          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold text-white"
                          style={{ backgroundColor: 'var(--color-navy)' }}
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                          Réessayer
                        </motion.button>
                      )}

                      <motion.button
                        type="button" title="Voir"
                        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                        className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
                        style={{ color: 'rgba(3,23,61,0.45)' }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-navy)')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(3,23,61,0.45)')}
                      >
                        <Eye className="h-4 w-4" />
                      </motion.button>

                      <motion.button
                        type="button" title="Télécharger"
                        disabled={d.statut !== 'TERMINE'}
                        whileHover={d.statut === 'TERMINE' ? { scale: 1.1 } : {}}
                        whileTap={d.statut === 'TERMINE' ? { scale: 0.95 } : {}}
                        className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
                        style={{
                          color: d.statut === 'TERMINE' ? 'var(--color-orange)' : 'rgba(3,23,61,0.2)',
                          cursor: d.statut === 'TERMINE' ? 'pointer' : 'not-allowed',
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>

        {/* ── Pagination ── */}
        {!loading && filtered.length > 0 && (
          <div
            className="flex items-center justify-between px-5 py-3.5"
            style={{ borderTop: '1px solid rgba(3,23,61,0.07)' }}
          >
            <p className="text-[13px]" style={{ color: 'rgba(3,23,61,0.5)' }}>
              Affichage de{' '}
              <span className="font-semibold" style={{ color: 'var(--color-navy)' }}>
                {Math.min(paginated.length, PAGE_SIZE)}
              </span>{' '}
              sur{' '}
              <span className="font-semibold" style={{ color: 'var(--color-navy)' }}>
                {filtered.length}
              </span>{' '}
              demandes
            </p>

            <div className="flex items-center gap-1">
              <motion.button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                whileTap={page > 1 ? { scale: 0.93 } : {}}
                className="flex h-8 w-8 items-center justify-center rounded-lg border transition-colors"
                style={{
                  borderColor: 'rgba(3,23,61,0.12)',
                  color: page === 1 ? 'rgba(3,23,61,0.2)' : 'var(--color-navy)',
                  cursor: page === 1 ? 'not-allowed' : 'pointer',
                }}
              >
                <ChevronLeft className="h-4 w-4" />
              </motion.button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <motion.button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  whileTap={{ scale: 0.93 }}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border text-[13px] font-medium transition-colors"
                  style={{
                    borderColor: p === page ? 'var(--color-navy)' : 'rgba(3,23,61,0.12)',
                    backgroundColor: p === page ? 'var(--color-navy)' : 'transparent',
                    color: p === page ? '#fff' : 'var(--color-navy)',
                  }}
                >
                  {p}
                </motion.button>
              ))}

              <motion.button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                whileTap={page < totalPages ? { scale: 0.93 } : {}}
                className="flex h-8 w-8 items-center justify-center rounded-lg border transition-colors"
                style={{
                  borderColor: 'rgba(3,23,61,0.12)',
                  color: page === totalPages ? 'rgba(3,23,61,0.2)' : 'var(--color-navy)',
                  cursor: page === totalPages ? 'not-allowed' : 'pointer',
                }}
              >
                <ChevronRight className="h-4 w-4" />
              </motion.button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}