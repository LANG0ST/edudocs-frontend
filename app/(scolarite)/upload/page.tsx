"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { GraduationCap, FileText, ClipboardCheck, BookOpen, Award, BarChart2, ChevronLeft, ChevronRight, Settings, Check } from 'lucide-react'

const documentTypes = [
    { id: 'DIPLOME', label: 'Diplôme', description: 'Certificat final de votre diplôme', icon: GraduationCap },
    { id: 'CERTIFICAT_SCOLARITE', label: 'Certificat de scolarité', description: 'Attestation de scolarité pour année académique', icon: FileText },
    { id: 'ATTESTATION_INSCRIPTION', label: "Attestation d'inscription", description: 'Preuve d\'inscription administrative', icon: ClipboardCheck },
    { id: 'RELEVE_DE_NOTES', label: 'Relevé de notes', description: 'Relevé détaillé de vos notes', icon: BookOpen },
    { id: 'ATTESTATION_REUSSITE', label: 'Attestation de réussite', description: 'Attestation de validation de semestre', icon: Award },
    { id: 'ATTESTATION_CLASSEMENT', label: 'Attestation de classement', description: 'Attestation de votre classement', icon: BarChart2 },
]

const steps = [
    { label: 'Type de document', icon: FileText },
    { label: 'Paramètres', icon: Settings },
    { label: 'Confirmation', icon: Check },
]

function Stepper({ currentStep }: { currentStep: number }) {
    return (
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-4">
            {steps.map((step, index) => {
                const Icon = step.icon
                const isPending = index > currentStep
                return (
                    <div key={step.label} className="flex items-center">
                        <div className="flex flex-col items-center gap-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-sm border-2" style={{ backgroundColor: !isPending ? 'var(--color-orange)' : 'white', borderColor: !isPending ? 'var(--color-orange)' : 'rgba(181,103,26,0.2)' }}>
                                <Icon className="h-[18px] w-[18px]" style={{ color: isPending ? 'rgba(3,23,61,0.35)' : '#fff' }} />
                            </div>
                            <span className="text-center text-[12px] font-medium whitespace-nowrap" style={{ color: isPending ? 'rgba(3,23,61,0.38)' : 'var(--color-navy)' }}>{step.label}</span>
                        </div>
                        {index < steps.length - 1 && <div className="mb-6 mx-4 hidden h-px w-16 bg-[rgba(3,23,61,0.12)] sm:block" />}
                    </div>
                )
            })}
        </div>
    )
}

function DocTypeCard({ id, label, description, icon: Icon, selected, onSelect }: any) {
    return (
        <button type="button" onClick={onSelect} className="relative flex min-h-[170px] flex-col gap-4 rounded-sm border-2 bg-white p-4 text-left sm:p-5" style={{ borderColor: selected ? 'var(--color-orange)' : 'rgba(3,23,61,0.1)' }}>
            <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg" style={{ backgroundColor: 'var(--color-orange)' }}>
                    <Icon className="h-6 w-6" style={{ color: '#fff' }} />
                </div>
                <div className="h-5 w-5 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0" style={{ borderColor: selected ? 'var(--color-orange)' : 'rgba(3,23,61,0.22)' }}>
                    {selected && <div className="h-2 w-2 rounded-full bg-white" />}
                </div>
            </div>
            <div>
                <p className="text-[15px] font-semibold" style={{ color: 'var(--color-navy)' }}>{label}</p>
                <p className="mt-1 text-[13px] leading-snug" style={{ color: 'rgba(3,23,61,0.48)' }}>{description}</p>
            </div>
        </button>
    )
}

export default function UploadStep1Page() {
    const router = useRouter()
    const [selected, setSelected] = useState<string | null>(null)

    return (
        <div className="flex min-h-[100dvh] items-start justify-center p-4 pb-24 sm:items-center ">
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.38 }} className="bg-transparent w-full max-w-[1200px] rounded-2xl px-5 sm:px-8 lg:px-10">
                <div className="mb-4 flex justify-center sm:mb-5"><div className="relative h-14 w-14 overflow-hidden  sm:h-16 sm:w-16"><Image src="/images/logo.png" alt="EduDocs" fill sizes="64px" className="object-contain" /></div></div>

                <div className="mb-6 text-center sm:mb-7">
                    <h1 className="text-[20px] font-bold sm:text-[24px]" style={{ color: 'var(--color-navy)' }}>Upload de Documents</h1>
                    <p className="mt-1.5 text-[13px] sm:text-[14px]" style={{ color: 'rgba(3,23,61,0.52)' }}>Étape 1 : Sélectionnez le type de document.</p>
                </div>

                <div className="mb-6 sm:mb-8"><Stepper currentStep={0} /></div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                    {documentTypes.map((type) => (
                        <DocTypeCard key={type.id} {...type} selected={selected === type.id} onSelect={() => setSelected(type.id)} />
                    ))}
                </div>

                <div className="mt-7 h-px w-full" style={{ backgroundColor: 'rgba(3,23,61,0.07)' }} />

                <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <motion.button type="button" onClick={() => router.back()} whileHover={{ x: -2 }} whileTap={{ scale: 0.97 }} className="flex w-full items-center justify-center gap-1.5 rounded-lg border px-5 py-2.5 text-[13px] font-medium sm:w-auto" style={{ color: 'var(--color-navy)', borderColor: 'rgba(3,23,61,0.15)' }}>
                        <ChevronLeft className="h-4 w-4" />
                        Retour
                    </motion.button>

                    <motion.button type="button" onClick={() => selected && router.push(`/upload/resume?type=${selected}`)} disabled={!selected} whileHover={selected ? { x: 2 } : {}} whileTap={selected ? { scale: 0.97 } : {}} className="flex w-full items-center justify-center gap-1.5 rounded-lg px-6 py-2.5 text-[13px] font-semibold text-white transition-all sm:w-auto" style={{ backgroundColor: selected ? 'var(--color-orange)' : 'rgba(181,103,26,0.18)', cursor: selected ? 'pointer' : 'not-allowed' }}>
                        Continuer
                        <ChevronRight className="h-4 w-4" />
                    </motion.button>
                </div>
            </motion.div>
        </div>
    )
}
