'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useSession } from '@/lib/auth-client'
import { api, type DocumentPreview } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { ArrowLeft, Download, Copy, ExternalLink, FileText } from 'lucide-react'
import { StudentPageShell } from '@/components/student-page-shell'

const typeDocumentLabel: Record<string, string> = {
    RELEVE_DE_NOTES: 'Relevé de notes',
    CERTIFICAT_SCOLARITE: 'Certificat de scolarité',
    ATTESTATION_INSCRIPTION: "Attestation d'inscription",
    ATTESTATION_REUSSITE: 'Attestation de réussite',
    ATTESTATION_CLASSEMENT: 'Attestation de classement',
    DIPLOME: 'Diplôme',
}

export default function PortfolioDocumentPage() {
    const session = useSession()
    const params = useParams<{ id: string }>()
    const [document, setDocument] = useState<DocumentPreview | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadDocument = async () => {
            try {
                const data = await api.getDocumentPreview(params.id)
                setDocument(data)
            } catch (error) {
                console.error('Failed to fetch document preview:', error)
            } finally {
                setLoading(false)
            }
        }

        if (session?.data?.user && params.id) {
            loadDocument()
        }
    }, [params.id, session])

    const handleCopyCode = async () => {
        if (!document?.codeVerification) {
            return
        }

        await navigator.clipboard.writeText(document.codeVerification)
    }

    if (loading) {
        return <Skeleton className="h-[70vh] w-full" />
    }

    if (!document) {
        return (
            <div className="rounded-lg border border-[#E5DDD5] bg-white p-8 text-center">
                <p className="text-[#6B7280]">Document introuvable.</p>
                <Button asChild className="mt-4 bg-[#132447] hover:bg-[#1B2B4B] text-white">
                    <Link href="/portfolio">Retour au portfolio</Link>
                </Button>
            </div>
        )
    }

    return (
        <StudentPageShell
            eyebrow="Étudiant / Mes documents / Aperçu"
            title={typeDocumentLabel[document.typeDocument] || document.typeDocument}
            description="Aperçu et métadonnées du document sélectionné."
            actions={
                <Button asChild variant="outline" className="border-[#E5DDD5] text-[#1B2B4B]">
                    <Link href="/portfolio">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Retour au portfolio
                    </Link>
                </Button>
            }
        >
            <div className="space-y-6">
                <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                    <Link href="/dashboard" className="hover:text-[#1B2B4B]">Dashboard</Link>
                    <span>/</span>
                    <Link href="/portfolio" className="hover:text-[#1B2B4B]">Mes documents</Link>
                    <span>/</span>
                    <span className="text-[#8B5E3C]">Aperçu</span>
                </div>

                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                    <div className="space-y-4">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-sm text-[#6B7280]">Aperçu du document</p>
                                <h1 className="text-3xl font-bold text-[#1B2B4B]">
                                    {typeDocumentLabel[document.typeDocument] || document.typeDocument}
                                </h1>
                                <p className="mt-1 text-[#6B7280]">
                                    {document.anneeAcademique || '—'}
                                    {document.semestre ? ` · ${document.semestre}` : ''}
                                </p>
                            </div>

                            <Badge className={document.statut === 'ACTIF' ? 'bg-[#108d6a]' : 'bg-[#fd4b6c]'}>
                                {document.statut === 'ACTIF' ? 'Actif' : 'Révoqué'}
                            </Badge>
                        </div>

                        <Card className="overflow-hidden border-[#E5DDD5] bg-white">
                            <div className="flex items-center justify-between border-b border-[#E5DDD5] px-4 py-3">
                                <div className="flex items-center gap-2 text-sm font-medium text-[#1B2B4B]">
                                    <FileText className="h-4 w-4 text-[#8B5E3C]" />
                                    Document PDF
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button asChild variant="outline" className="border-[#E5DDD5] text-[#1B2B4B]">
                                        <a href={document.downloadUrl} target="_blank" rel="noreferrer">
                                            <ExternalLink className="mr-2 h-4 w-4" />
                                            Ouvrir
                                        </a>
                                    </Button>
                                    <Button asChild className="bg-[#132447] hover:bg-[#1B2B4B] text-white">
                                        <a href={document.downloadUrl} download>
                                            <Download className="mr-2 h-4 w-4" />
                                            Télécharger
                                        </a>
                                    </Button>
                                </div>
                            </div>

                            <div className="bg-[#F5F0EB] p-4">
                                <iframe
                                    title="Aperçu du document"
                                    src={document.downloadUrl}
                                    className="h-[70vh] w-full rounded-lg border border-[#E5DDD5] bg-white"
                                />
                            </div>
                        </Card>
                    </div>

                    <div className="space-y-4">
                        <Card className="border-[#E5DDD5] bg-white p-4">
                            <h2 className="text-sm font-semibold uppercase tracking-wide text-[#6B7280]">Actions</h2>
                            <div className="mt-4 space-y-3">
                                <Button className="w-full bg-[#132447] hover:bg-[#1B2B4B] text-white" asChild>
                                    <a href={document.downloadUrl} target="_blank" rel="noreferrer">
                                        <Download className="mr-2 h-4 w-4" />
                                        Télécharger le PDF
                                    </a>
                                </Button>
                                <Button variant="outline" className="w-full border-[#E5DDD5] text-[#1B2B4B]" onClick={handleCopyCode}>
                                    <Copy className="mr-2 h-4 w-4" />
                                    Copier le code
                                </Button>
                                <Button asChild variant="outline" className="w-full border-[#E5DDD5] text-[#1B2B4B]">
                                    <Link href="/portfolio">
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Retour au portfolio
                                    </Link>
                                </Button>
                            </div>
                        </Card>

                        <Card className="border-[#E5DDD5] bg-white p-4">
                            <h2 className="text-sm font-semibold uppercase tracking-wide text-[#6B7280]">Métadonnées</h2>
                            <dl className="mt-4 space-y-3 text-sm">
                                <div className="flex items-start justify-between gap-4">
                                    <dt className="text-[#6B7280]">Type</dt>
                                    <dd className="text-right font-medium text-[#1B2B4B]">{typeDocumentLabel[document.typeDocument] || document.typeDocument}</dd>
                                </div>
                                <div className="flex items-start justify-between gap-4">
                                    <dt className="text-[#6B7280]">Émis le</dt>
                                    <dd className="text-right font-medium text-[#1B2B4B]">
                                        {format(new Date(document.emissLe), 'd MMMM yyyy', { locale: fr })}
                                    </dd>
                                </div>
                                <div className="flex items-start justify-between gap-4">
                                    <dt className="text-[#6B7280]">Blockchain</dt>
                                    <dd className="text-right font-medium text-[#1B2B4B]">{document.statutBlockchain}</dd>
                                </div>
                                <div className="flex items-start justify-between gap-4">
                                    <dt className="text-[#6B7280]">Code</dt>
                                    <dd className="max-w-[180px] break-all text-right font-mono text-xs text-[#1B2B4B]">
                                        {document.codeVerification}
                                    </dd>
                                </div>
                                {document.txHash ? (
                                    <div className="flex items-start justify-between gap-4">
                                        <dt className="text-[#6B7280]">Tx hash</dt>
                                        <dd className="max-w-[180px] break-all text-right font-mono text-xs text-[#1B2B4B]">
                                            {document.txHash}
                                        </dd>
                                    </div>
                                ) : null}
                            </dl>
                        </Card>
                    </div>
                </div>
             </div>
        </StudentPageShell>
    )
}