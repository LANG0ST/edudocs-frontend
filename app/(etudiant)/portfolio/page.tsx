'use client'

import { useEffect, useState } from 'react'
import { useSession } from '@/lib/auth-client'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { api, type DocumentSummary } from '@/lib/api'
import { Eye, FileText, Plus, Search, Download } from 'lucide-react'
import { StudentPageShell } from '@/components/student-page-shell'

const typeDocumentLabel: Record<string, string> = {
    RELEVE_DE_NOTES: 'Relevé de notes',
    CERTIFICAT_SCOLARITE: 'Certificat de scolarité',
    ATTESTATION_INSCRIPTION: "Attestation d'inscription",
    ATTESTATION_REUSSITE: 'Attestation de réussite',
    ATTESTATION_CLASSEMENT: 'Attestation de classement',
    DIPLOME: 'Diplôme',
}

const categories = [
    { value: 'ALL', label: 'Tous' },
    { value: 'DIPLOME', label: 'Diplômes' },
    { value: 'RELEVE_DE_NOTES', label: 'Relevés de notes' },
    { value: 'ATTESTATION', label: 'Attestations' },
]

function matchesCategory(document: DocumentSummary, category: string) {
    if (category === 'ALL') {
        return true
    }

    if (category === 'ATTESTATION') {
        return document.typeDocument.startsWith('ATTESTATION_')
    }

    return document.typeDocument === category
}

export default function PortfolioPage() {
    const session = useSession()
    const [documents, setDocuments] = useState<DocumentSummary[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [category, setCategory] = useState('ALL')

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                const data = await api.getMonPortfolio()
                setDocuments(data)
            } catch (error) {
                console.error('Failed to fetch documents:', error)
            } finally {
                setLoading(false)
            }
        }

        if (session?.data?.user) {
            fetchDocuments()
        }
    }, [session])

    const filteredDocuments = documents.filter((document) => {
        const matchesSearch =
            typeDocumentLabel[document.typeDocument]?.toLowerCase().includes(search.toLowerCase()) ||
            document.codeVerification.toLowerCase().includes(search.toLowerCase()) ||
            `${document.anneeAcademique || ''} ${document.semestre || ''}`.toLowerCase().includes(search.toLowerCase())

        return matchesSearch && matchesCategory(document, category)
    })

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-12 w-full" />
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="h-[28rem]" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <StudentPageShell
            eyebrow="Étudiant / Mes documents"
            title="Mon portefeuille"
            description="Gérez et accédez à tous vos documents académiques officiels sécurisés."
            actions={
                <Button asChild className="bg-[#af6a35] hover:bg-[#8B5E3C] text-white w-fit">
                    <Link href="/demande/nouvelle">
                        <Plus className="mr-2 h-4 w-4" />
                        Nouveau document
                    </Link>
                </Button>
            }
        >
            <div className="flex flex-col gap-3 rounded-lg border border-[#E5DDD5] bg-white p-4 lg:flex-row lg:items-center">
                <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
                    <Input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Rechercher un document..."
                        className="pl-9 border-[#E5DDD5] bg-[#F8FAFC]"
                    />
                </div>

                <div className="flex flex-wrap gap-2">
                    {categories.map((item) => (
                        <Button
                            key={item.value}
                            type="button"
                            variant={category === item.value ? 'default' : 'outline'}
                            onClick={() => setCategory(item.value)}
                            className={
                                category === item.value
                                    ? 'bg-[#132447] hover:bg-[#1B2B4B] text-white'
                                    : 'border-[#E5DDD5] text-[#1B2B4B]'
                            }
                        >
                            {item.label}
                        </Button>
                    ))}
                </div>
            </div>

            {filteredDocuments.length === 0 ? (
                <div className="rounded-lg border border-dashed border-[#D7D0C7] bg-white py-16 text-center">
                    <p className="text-[#6B7280]">Aucun document disponible pour le moment.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {filteredDocuments.map((doc) => {
                        const previewLabel = typeDocumentLabel[doc.typeDocument] || doc.typeDocument

                        return (
                            <Card key={doc.id} className="overflow-hidden border-[#E5DDD5] bg-white shadow-sm">
                                <div className="border-b border-[#E5DDD5] bg-[#F8FAFC] p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-wide text-[#8B5E3C]">
                                                {doc.typeDocument === 'DIPLOME' ? 'Diplôme d\'état' : 'Document académique'}
                                            </p>
                                            <h3 className="mt-1 text-lg font-semibold text-[#1B2B4B]">
                                                {previewLabel}
                                            </h3>
                                            <p className="text-sm text-[#6B7280]">
                                                {doc.anneeAcademique || '—'}
                                                {doc.semestre ? ` · ${doc.semestre}` : ''}
                                            </p>
                                        </div>
                                        <Badge
                                            className={
                                                doc.statut === 'ACTIF'
                                                    ? 'bg-[#108d6a]'
                                                    : 'bg-[#fd4b6c]'
                                            }
                                        >
                                            {doc.statut === 'ACTIF' ? 'Actif' : 'Révoqué'}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="p-4">
                                    <div className="mb-4 flex h-48 items-center justify-center rounded-lg border border-[#E5DDD5] bg-[#F5F0EB]">
                                        <div className="text-center">
                                            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#8B5E3C] shadow-sm">
                                                <FileText className="h-6 w-6" />
                                            </div>
                                            <p className="text-sm font-medium text-[#1B2B4B]">Aperçu du document</p>
                                            <p className="mt-1 text-xs text-[#6B7280]">{doc.statutBlockchain}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-sm text-[#6B7280]">
                                        <div className="flex items-center justify-between gap-3">
                                            <span>Émis le</span>
                                            <span className="font-medium text-[#1B2B4B]">
                                                {format(new Date(doc.emissLe), 'd MMM yyyy', { locale: fr })}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between gap-3">
                                            <span>Code de vérification</span>
                                            <span className="font-mono text-xs text-[#1B2B4B]">{doc.codeVerification}</span>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex gap-2">
                                        <Button asChild className="flex-1 bg-[#132447] hover:bg-[#1B2B4B] text-white">
                                            <Link href={`/portfolio/${doc.id}`}>
                                                <Eye className="mr-2 h-4 w-4" />
                                                Aperçu
                                            </Link>
                                        </Button>
                                        <Button asChild variant="outline" className="border-[#E5DDD5] text-[#1B2B4B]">
                                            <a href={api.getDocumentDownloadUrl(doc.id)} target="_blank" rel="noreferrer">
                                                <Download className="h-4 w-4" />
                                            </a>
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        )
                    })}

                    <Card className="border-dashed border-[#D7D0C7] bg-white p-6">
                        <Link href="/demande/nouvelle" className="flex h-full min-h-[24rem] flex-col items-center justify-center text-center">
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[#D7D0C7] bg-[#F5F0EB] text-[#8B5E3C]">
                                <Plus className="h-6 w-6" />
                            </div>
                            <h3 className="text-lg font-semibold text-[#1B2B4B]">Nouveau document</h3>
                            <p className="mt-2 max-w-xs text-sm text-[#6B7280]">
                                Demandez une nouvelle attestation ou un diplôme depuis le flux de demande.
                            </p>
                        </Link>
                    </Card>
                </div>
            )}
        </StudentPageShell>
    )
}
