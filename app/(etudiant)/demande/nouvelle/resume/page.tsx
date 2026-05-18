'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import {
  GraduationCap, FileText, ClipboardCheck, BookOpen, Award, BarChart2,
  ChevronLeft, ChevronRight, Settings, Check, ChevronDown,
} from 'lucide-react'

const steps = [
  { label: 'Type de document', icon: FileText },
  { label: 'Paramètres', icon: Settings },
  { label: 'Confirmation', icon: Check },
]

const years = ['2020-2021', '2021-2022', '2022-2023', '2023-2024', '2024-2025', '2025-2026']
const semesters = ['Première semestre', 'Deuxième semestre']

const motifOptions: Record<string, string[]> = {
  DIPLOME: ['Candidature Master', 'Candidature Doctorat', "Demande d'emploi", 'Visa/Immigration', 'Autre'],
  CERTIFICAT_SCOLARITE: ['Demande de bourse', 'Logement', 'Visa étudiant', 'Banque/Crédit', 'Autre'],
  ATTESTATION_INSCRIPTION: ['Inscription administrative', 'Demande de stage', 'Échange international', 'Visa', 'Autre'],
  RELEVE_DE_NOTES: ['Candidature Master', 'Candidature stage', 'Université étrangère', 'Bourse', 'Autre'],
  ATTESTATION_REUSSITE: ['Validation de semestre', 'Transfert', 'Progression académique', 'Autre'],
  ATTESTATION_CLASSEMENT: ['Bourse doctorale', 'Publication', 'Candidature post-doc', 'Autre'],
}

const requiresYear: Record<string, boolean> = {
  DIPLOME: false, CERTIFICAT_SCOLARITE: true, ATTESTATION_INSCRIPTION: true,
  RELEVE_DE_NOTES: true, ATTESTATION_REUSSITE: true, ATTESTATION_CLASSEMENT: true,
}

const requiresSemester: Record<string, boolean> = {
  DIPLOME: false, CERTIFICAT_SCOLARITE: false, ATTESTATION_INSCRIPTION: false,
  RELEVE_DE_NOTES: true, ATTESTATION_REUSSITE: true, ATTESTATION_CLASSEMENT: false,
}

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

function StyledSelect({ label, placeholder, value, options, onChange }: {
  label: string; placeholder: string; value: string
  options: string[]; onChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <label className="mb-1.5 block text-[13px] font-semibold" style={{ color: 'var(--color-navy)' }}>
        {label}
      </label>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-lg border-2 bg-white px-4 py-3 text-[14px] transition-colors"
        style={{
          borderColor: open ? 'var(--color-orange)' : 'rgba(3,23,61,0.12)',
          color: value ? 'var(--color-navy)' : 'rgba(3,23,61,0.4)',
        }}
      >
        <span>{value || placeholder}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-4 w-4" style={{ color: 'rgba(3,23,61,0.4)' }} />
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
              <button key={opt} type="button"
                onClick={() => { onChange(opt); setOpen(false) }}
                className="flex w-full items-center px-4 py-2.5 text-[14px] transition-colors hover:bg-[rgba(181,103,26,0.08)]"
                style={{ color: value === opt ? 'var(--color-orange)' : 'var(--color-navy)', fontWeight: value === opt ? 600 : 400 }}
              >
                {opt}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ResumeStep2Content() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [type, setType] = useState<string | null>(null)
  const [formData, setFormData] = useState({ anneeAcademique: '', semestre: '', motif: '' })

  useEffect(() => {
    const typeParam = searchParams.get('type')
    if (!typeParam) router.push('/demande/nouvelle')
    else {
      setType(typeParam)
      // Pre-fill if coming back from confirmation (modifier)
      const motif = searchParams.get('motif') || ''
      const anneeAcademique = searchParams.get('anneeAcademique') || ''
      const semestre = searchParams.get('semestre') || ''
      setFormData({ motif, anneeAcademique, semestre })
    }
  }, [searchParams, router])

  const handleChange = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }))

  const handleContinuer = () => {
    if (!type || !isValid) return
    const params = new URLSearchParams({ type, motif: formData.motif })
    if (formData.anneeAcademique) params.set('anneeAcademique', formData.anneeAcademique)
    if (formData.semestre) params.set('semestre', formData.semestre)
    router.push(`/demande/nouvelle/confirmation?${params.toString()}`)
  }

  if (!type) return null

  const TypeIcon = typeIcons[type] ?? FileText
  const needsYear = requiresYear[type]
  const needsSemester = requiresSemester[type]
  const isValid =
    formData.motif &&
    (!needsYear || formData.anneeAcademique) &&
    (!needsSemester || formData.semestre)

  return (
    <div className="flex  items-start justify-center p-4 pb-24 sm:items-center sm:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38, ease: 'easeOut' }}
        className="bg-transparent w-full max-w-[680px] rounded-2xl p-5 sm:p-8 lg:p-10"
      >
        <div className="mb-4 flex justify-center sm:mb-5">
          <div className="relative h-14 w-14 overflow-hidden sm:h-16 sm:w-16">
            <Image src="/images/logo.png" alt="EduDocs" fill sizes="64px" className="object-contain" />
          </div>
        </div>

        <div className="mb-6 text-center sm:mb-7">
          <h1 className="text-[20px] font-bold sm:text-[24px]" style={{ color: 'var(--color-navy)' }}>
            Nouvelle Demande de Document
          </h1>
          <p className="mt-1.5 text-[13px] sm:text-[14px]" style={{ color: 'rgba(3,23,61,0.52)' }}>
            Étape 2 : Renseignez les détails de votre demande.
          </p>
        </div>

        <div className="mb-6 sm:mb-8">
          <Stepper currentStep={1} />
        </div>

        {/* Selected doc type badge */}
        <div className="mb-5 flex items-center gap-3 rounded-lg border-2 px-4 py-3"
          style={{ borderColor: 'rgba(181,103,26,0.25)', backgroundColor: 'rgba(181,103,26,0.05)' }}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: 'var(--color-orange)' }}>
            <TypeIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide" style={{ color: 'rgba(3,23,61,0.45)' }}>
              Type sélectionné
            </p>
            <p className="text-[14px] font-semibold" style={{ color: 'var(--color-navy)' }}>
              {typeLabels[type] ?? type}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {needsYear && (
            <StyledSelect label="Année académique" placeholder="Sélectionnez une année"
              value={formData.anneeAcademique} options={years}
              onChange={(v) => handleChange('anneeAcademique', v)} />
          )}
          {needsSemester && (
            <StyledSelect label="Semestre" placeholder="Sélectionnez un semestre"
              value={formData.semestre} options={semesters}
              onChange={(v) => handleChange('semestre', v)} />
          )}
          <StyledSelect label="Motif de la demande" placeholder="Sélectionnez un motif"
            value={formData.motif} options={motifOptions[type] ?? []}
            onChange={(v) => handleChange('motif', v)} />
        </div>

        <div className="mt-7 h-px w-full" style={{ backgroundColor: 'rgba(3,23,61,0.07)' }} />

        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <motion.button type="button" onClick={() => router.back()}
            whileHover={{ x: -2 }} whileTap={{ scale: 0.97 }}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border px-5 py-2.5 text-[13px] font-medium sm:w-auto"
            style={{ color: 'var(--color-navy)', borderColor: 'rgba(3,23,61,0.15)' }}>
            <ChevronLeft className="h-4 w-4" />
            Retour
          </motion.button>

          <motion.button type="button" onClick={handleContinuer} disabled={!isValid}
            whileHover={isValid ? { x: 2 } : {}} whileTap={isValid ? { scale: 0.97 } : {}}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg px-6 py-2.5 text-[13px] font-semibold text-white transition-all sm:w-auto"
            style={{
              backgroundColor: isValid ? 'var(--color-orange)' : 'rgba(181,103,26,0.18)',
              cursor: isValid ? 'pointer' : 'not-allowed',
            }}>
            Continuer
            <ChevronRight className="h-4 w-4" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}

export default function ResumeStep2Page() {
  return (
    <Suspense fallback={null}>
      <ResumeStep2Content />
    </Suspense>
  )
}