'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import {
  GraduationCap, FileText, ClipboardCheck, BookOpen, Award, BarChart2,
  ChevronRight, Settings, Check, Pencil, Mail, ShieldCheck,
} from 'lucide-react'
import { api } from '@/lib/api'

const steps = [
  { label: 'Type de document', icon: FileText },
  { label: 'Paramètres', icon: Settings },
  { label: 'Confirmation', icon: Check },
]

const typeLabels: Record<string, string> = {
  DIPLOME: 'Diplôme',
  CERTIFICAT_SCOLARITE: 'Certificat de scolarité',
  ATTESTATION_INSCRIPTION: "Attestation d'inscription",
  RELEVE_DE_NOTES: 'Relevé de notes',
  ATTESTATION_REUSSITE: 'Attestation de réussite',
  ATTESTATION_CLASSEMENT: 'Attestation de classement',
}

const typeIcons: Record<string, React.ElementType> = {
  DIPLOME: GraduationCap, CERTIFICAT_SCOLARITE: FileText,
  ATTESTATION_INSCRIPTION: ClipboardCheck, RELEVE_DE_NOTES: BookOpen,
  ATTESTATION_REUSSITE: Award, ATTESTATION_CLASSEMENT: BarChart2,
}

function Stepper({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-4">
      {steps.map((step, index) => {
        const Icon = step.icon
        const isPending = index > currentStep
        return (
          <div key={step.label} className="flex items-center">
            <div className="flex flex-col items-center gap-2">
              <motion.div
                initial={false}
                animate={{
                  backgroundColor: !isPending ? 'var(--color-orange)' : 'white',
                  borderColor: !isPending ? 'var(--color-orange)' : 'rgba(181,103,26,0.2)',
                }}
                transition={{ duration: 0.3 }}
                className="flex h-10 w-10 items-center justify-center rounded-sm border-2"
              >
                <Icon className="h-[18px] w-[18px]"
                  style={{ color: isPending ? 'rgba(3,23,61,0.35)' : '#fff' }} />
              </motion.div>
              <span className="text-center text-[12px] font-medium whitespace-nowrap"
                style={{ color: isPending ? 'rgba(3,23,61,0.38)' : 'var(--color-navy)' }}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className="mb-6 mx-4 hidden h-px w-16 bg-[rgba(3,23,61,0.12)] sm:block" />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Summary row ─────────────────────────────────────────────────────────────
function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3"
      style={{ borderBottom: '1px solid rgba(3,23,61,0.07)' }}>
      <span className="text-[13px]" style={{ color: 'rgba(3,23,61,0.5)' }}>{label}</span>
      <span className="text-[13px] font-semibold" style={{ color: 'var(--color-navy)' }}>{value}</span>
    </div>
  )
}

function ConfirmationStep3Content() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [accepted, setAccepted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const type = searchParams.get('type')
  const motif = searchParams.get('motif')
  const anneeAcademique = searchParams.get('anneeAcademique')
  const semestre = searchParams.get('semestre')

  useEffect(() => {
    if (!type || !motif) router.push('/demande/nouvelle')
  }, [type, motif, router])

  const handleSubmit = async () => {
    if (!accepted || !type || !motif) return
    setLoading(true)
    setError(null)
    try {
      await api.createDemande({
        typeDocument: type,
        anneeAcademique: anneeAcademique || null,
        semestre: semestre || null,
        motif,
      })
      router.push('/demande/mes-demandes')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  const handleModifier = () => {
    const params = new URLSearchParams({ type: type! })
    if (motif) params.set('motif', motif)
    if (anneeAcademique) params.set('anneeAcademique', anneeAcademique)
    if (semestre) params.set('semestre', semestre)
    router.push(`/demande/nouvelle/resume?${params.toString()}`)
  }

  if (!type || !motif) return null

  const TypeIcon = typeIcons[type] ?? FileText

  return (
    <div className="flex items-start justify-center p-4 pb-24 sm:items-center sm:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38, ease: 'easeOut' }}
        className="bg-transparent w-full max-w-[720px] rounded-2xl p-5 sm:p-8 lg:p-10"
      >
        {/* Logo */}
        <div className="mb-4 flex justify-center sm:mb-5">
          <div className="relative h-14 w-14 overflow-hidden sm:h-16 sm:w-16">
            <Image src="/images/logo.png" alt="EduDocs" fill sizes="64px" className="object-contain" />
          </div>
        </div>

        {/* Title */}
        <div className="mb-6 text-center sm:mb-7">
          <h1 className="text-[20px] font-bold sm:text-[24px]" style={{ color: 'var(--color-navy)' }}>
            Nouvelle Demande de Document
          </h1>
          <p className="mt-1.5 text-[13px] sm:text-[14px]" style={{ color: 'rgba(3,23,61,0.52)' }}>
            Étape 3 : Vérifiez et confirmez votre demande.
          </p>
        </div>

        {/* Stepper — all 3 filled */}
        <div className="mb-6 sm:mb-8">
          <Stepper currentStep={2} />
        </div>

        {/* Summary card */}
        <div className="rounded-xl border-2 bg-white overflow-hidden"
          style={{ borderColor: 'rgba(3,23,61,0.1)' }}>

          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-4"
            style={{ backgroundColor: 'rgba(181,103,26,0.06)', borderBottom: '1px solid rgba(3,23,61,0.07)' }}>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: 'var(--color-orange)' }}>
              <TypeIcon className="h-5 w-5 text-white" />
            </div>
            <div>

              <p className="text-[20px] font-bold" style={{ color: 'var(--color-navy)' }}>
                {typeLabels[type] ?? type}
              </p>
            </div>
          </div>

          {/* Rows */}
          <div className="px-5">
            <SummaryRow label="Document" value={typeLabels[type] ?? type} />
            {anneeAcademique && <SummaryRow label="Année académique" value={anneeAcademique} />}
            {semestre && <SummaryRow label="Semestre" value={semestre} />}
            <SummaryRow label="Motif" value={motif} />
          </div>
        </div>

        {/* Email hint */}
        <div className="mt-4 flex items-start gap-3 rounded-xl px-4 py-3.5"
          style={{ backgroundColor: 'rgba(3,23,61,0.04)', border: '1px solid rgba(3,23,61,0.08)' }}>
          <Mail className="mt-0.5 h-4 w-4 shrink-0" style={{ color: 'var(--color-orange)' }} />
          <p className="text-[12.5px] leading-relaxed" style={{ color: 'rgba(3,23,61,0.6)' }}>
            Votre document sera généré automatiquement et envoyé à votre adresse email universitaire.
          </p>
        </div>

        {/* Consent checkbox */}
        <label className="mt-4 flex cursor-pointer items-start gap-3">
          <div className="relative mt-0.5 shrink-0">
            <input
              type="checkbox"
              className="sr-only"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
            />
            <motion.div
              animate={{
                backgroundColor: accepted ? 'var(--color-navy)' : 'white',
                borderColor: accepted ? 'var(--color-navy)' : 'rgba(3,23,61,0.25)',
              }}
              transition={{ duration: 0.18 }}
              className="flex h-5 w-5 items-center justify-center rounded border-2"
            >
              <AnimatePresence>
                {accepted && (
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Check className="h-3 w-3 text-white" strokeWidth={3} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
          <span className="text-[12.5px] leading-relaxed" style={{ color: 'rgba(3,23,61,0.6)' }}>
            J'accepte que mes données académiques soient utilisées pour générer ce document conformément à la politique de confidentialité de l'UCA.
          </span>
        </label>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 overflow-hidden rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-600"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Separator + actions */}
        <div className="mt-6 h-px w-full" style={{ backgroundColor: 'rgba(3,23,61,0.07)' }} />

        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Modifier instead of Retour */}
          <motion.button type="button" onClick={handleModifier}
            whileHover={{ x: -2 }} whileTap={{ scale: 0.97 }}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border px-5 py-2.5 text-[13px] font-medium sm:w-auto"
            style={{ color: 'var(--color-navy)', borderColor: 'rgba(3,23,61,0.15)' }}>
            <Pencil className="h-3.5 w-3.5" />
            Modifier
          </motion.button>

          <motion.button type="button" onClick={handleSubmit}
            disabled={!accepted || loading}
            whileHover={accepted && !loading ? { x: 2 } : {}}
            whileTap={accepted && !loading ? { scale: 0.97 } : {}}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg px-6 py-2.5 text-[13px] font-semibold text-white transition-all sm:w-auto"
            style={{
              backgroundColor: accepted && !loading ? 'var(--color-orange)' : 'rgba(181,103,26,0.18)',
              cursor: accepted && !loading ? 'pointer' : 'not-allowed',
            }}>
            {loading ? 'Soumission...' : 'Soumettre la demande'}
            {!loading && <ChevronRight className="h-4 w-4" />}
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}

export default function ConfirmationStep3Page() {
  return (
    <Suspense fallback={null}>
      <ConfirmationStep3Content />
    </Suspense>
  )
}