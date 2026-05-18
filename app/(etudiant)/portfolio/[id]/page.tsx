'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useSession } from '@/lib/auth-client'
import { api, type DocumentPreview } from '@/lib/api'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Download, Copy, FileText,
  ShieldCheck, ShieldOff, ExternalLink,
} from 'lucide-react'

const typeDocumentLabel: Record<string, string> = {
  RELEVE_DE_NOTES: 'Relevé de notes',
  CERTIFICAT_SCOLARITE: 'Certificat de scolarité',
  ATTESTATION_INSCRIPTION: "Attestation d'inscription",
  ATTESTATION_REUSSITE: 'Attestation de réussite',
  ATTESTATION_CLASSEMENT: 'Attestation de classement',
  DIPLOME: 'Diplôme fin d\'études',
}

function MetaRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3"
      style={{ borderBottom: '1px solid rgba(3,23,61,0.07)' }}>
      <span className="text-[12px]" style={{ color: 'rgba(3,23,61,0.5)' }}>{label}</span>
      <span className={`text-right text-[12px] font-semibold ${mono ? 'font-mono' : ''}`}
        style={{ color: 'var(--color-navy)' }}>
        {value}
      </span>
    </div>
  )
}

export default function PortfolioDocumentPage() {
  const session = useSession()
  const params = useParams<{ id: string }>()
  const [document, setDocument] = useState<DocumentPreview | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  const previewSrc = document?.downloadUrl ?? '/images/placeholder.pdf'
  const isActive = document?.statut === 'ACTIF'
  const title = document
    ? (typeDocumentLabel[document.typeDocument] ?? document.typeDocument)
    : 'Document introuvable'

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
    if (session?.data?.user && params.id) load()
  }, [params.id, session])

  const handleCopy = async () => {
    if (!document?.txHash) return
    await navigator.clipboard.writeText(document.txHash)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="px-6 py-8 md:px-8">
        <div className="h-8 w-48 animate-pulse rounded-lg mb-6" style={{ backgroundColor: 'rgba(3,23,61,0.07)' }} />
        <div className="grid gap-6 min-[1100px]:grid-cols-[1fr_320px]">
          <div className="h-[70vh] animate-pulse rounded-xl" style={{ backgroundColor: 'rgba(3,23,61,0.05)' }} />
          <div className="space-y-3">
            {[80, 60, 100, 70].map((w, i) => (
              <div key={i} className="h-4 animate-pulse rounded" style={{ width: `${w}%`, backgroundColor: 'rgba(3,23,61,0.07)' }} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-6 md:px-8 md:py-8">

      <div className="mb-6 flex items-center gap-2">
        <Link href="/portfolio"
          className="flex items-center gap-1.5 text-[13px] font-medium transition-colors"
          style={{ color: 'rgba(3,23,61,0.5)' }}>
          <ArrowLeft className="h-4 w-4" />
          Mes documents
        </Link>
        <span style={{ color: 'rgba(3,23,61,0.25)' }}>/</span>
        <span className="text-[13px] font-medium" style={{ color: 'var(--color-navy)' }}>{title}</span>
      </div>

      {/* ── Main layout ── */}
      <div className="grid gap-6 min-[1100px]:grid-cols-[1fr_300px] min-[1100px]:items-start">

        <div className="overflow-hidden rounded-xl border bg-white"
          style={{ borderColor: 'rgba(3,23,61,0.1)' }}>

          <div className="flex items-center justify-between gap-3 px-4 py-3"
            style={{ borderBottom: '1px solid rgba(3,23,61,0.08)' }}>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ backgroundColor: 'var(--color-orange)' }}>
                <FileText className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-[13px] font-semibold" style={{ color: 'var(--color-navy)' }}>{title}</p>
                {document && (
                  <p className="text-[11px]" style={{ color: 'rgba(3,23,61,0.45)' }}>
                    {document.anneeAcademique || ''}
                    {document.semestre ? ` · ${document.semestre}` : ''}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a href={previewSrc} target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[12px] font-medium transition-colors"
                style={{ borderColor: 'rgba(3,23,61,0.15)', color: 'var(--color-navy)' }}>
                <ExternalLink className="h-3.5 w-3.5" />
                Ouvrir
              </a>
            </div>
          </div>

          <div className="p-3" style={{ backgroundColor: 'rgba(3,23,61,0.03)' }}>
            <div className="overflow-hidden rounded-lg" style={{ height: 'calc(100vh - 260px)', minHeight: 480 }}>
              <iframe
                title="Aperçu du document"
                src={previewSrc}
                className="h-full w-full"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 min-[1100px]:sticky min-[1100px]:top-6">

          <div className="overflow-hidden rounded-xl border bg-white"
            style={{ borderColor: 'rgba(3,23,61,0.1)' }}>
            <div className="px-5 py-4" style={{ backgroundColor: 'var(--color-navy)' }}>
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-widest"
                  style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Statut du document
                </p>
                <span
                  className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                  style={{
                    backgroundColor: isActive ? 'rgba(16,141,106,0.2)' : 'rgba(253,75,108,0.2)',
                    color: isActive ? '#6ee7b7' : '#fca5a5',
                  }}>
                  {isActive ? <ShieldCheck className="h-3 w-3" /> : <ShieldOff className="h-3 w-3" />}
                  {isActive ? 'Actif' : 'Inactif'}
                </span>
              </div>
            </div>

            {/* Meta */}
            <div className="px-5 py-1">
              {document ? (
                <>
                  <MetaRow label="Université" value="Université Cadi Ayyad" />
                  <MetaRow label="Type" value={typeDocumentLabel[document.typeDocument] ?? document.typeDocument} />
                  <MetaRow label="Émis le" value={format(new Date(document.emissLe), 'd MMMM yyyy', { locale: fr })} />
                  <MetaRow label="Blockchain" value={document.statutBlockchain} />
                  <MetaRow label="Hash Blockchain" value={document.txHash || '0x7f3a9e8b2d4c1f6a9e8b2d4c1f6a9e8b2d4c1f6a'} mono />
                </>
              ) : (
                <p className="py-4 text-[13px]" style={{ color: 'rgba(3,23,61,0.45)' }}>
                  Aucun document chargé.
                </p>
              )}
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border bg-white p-4"
            style={{ borderColor: 'rgba(3,23,61,0.1)' }}>
            <div className="flex flex-col gap-2">
              <a href={previewSrc} download
                className="flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-[13px] font-semibold text-white"
                style={{ backgroundColor: 'var(--color-navy)' }}>
                <Download className="h-4 w-4" />
                Télécharger le PDF
              </a>

              <motion.button
                type="button"
                onClick={handleCopy}
                whileTap={{ scale: 0.97 }}
                className="flex w-full items-center justify-center gap-2 rounded-lg border py-2.5 text-[13px] font-medium transition-colors"
                style={{ borderColor: 'rgba(3,23,61,0.15)', color: 'var(--color-navy)' }}>
                <Copy className="h-4 w-4" />
                {copied ? 'Copié !' : 'Copier le hash blockchain'}
              </motion.button>

              <Link href="/portfolio"
                className="flex w-full items-center justify-center gap-2 rounded-lg border py-2.5 text-[13px] font-medium"
                style={{ borderColor: 'rgba(3,23,61,0.15)', color: 'var(--color-navy)' }}>
                <ArrowLeft className="h-4 w-4" />
                Retour au portfolio
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}