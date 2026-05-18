"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "@/lib/auth-client"
import { api, type DemandeSummary, type DocumentSummary } from "@/lib/api"
import { KpiCard } from "@/components/KpiCard"
import { RecentDocuments, type Document as RecentDocument } from "@/components/RecentDocuments"
import { StudentCard } from "@/components/StudentCard"

const typeDocumentLabel: Record<string, string> = {
    RELEVE_DE_NOTES: "Releve de notes",
    CERTIFICAT_SCOLARITE: "Certificat de scolarite",
    ATTESTATION_INSCRIPTION: "Attestation d'inscription",
    ATTESTATION_REUSSITE: "Attestation d'reussite",
    ATTESTATION_CLASSEMENT: "Attestation de classement",
    DIPLOME: "Diplome",
}

function formatDate(date: string) {
    return new Date(date).toLocaleDateString("fr-FR")
}

export default function Page() {
    const session = useSession()
    const router = useRouter()
    const [demandes, setDemandes] = useState<DemandeSummary[]>([])
    const [documents, setDocuments] = useState<DocumentSummary[]>([])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await api.getDashboardData()
                setDemandes(data.demandes)
                setDocuments(data.documents)
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error)
            }
        }

        if (session?.data?.user) {
            fetchData()
        }
    }, [session])

    const recentDocuments = useMemo<RecentDocument[]>(() => {
        const readyDocs = documents.slice(0, 3).map((document) => ({
            id: document.id,
            title: typeDocumentLabel[document.typeDocument] || document.typeDocument,
            date: formatDate(document.emissLe),
            status: "ready" as const,
        }))

        if (readyDocs.length >= 3) return readyDocs

        const processingDocs = demandes
            .filter((demande) => demande.statut !== "TERMINE")
            .slice(0, 3 - readyDocs.length)
            .map((demande) => ({
                id: demande.id,
                title: typeDocumentLabel[demande.typeDocument] || demande.typeDocument,
                date: formatDate(demande.createdAt),
                status: "processing" as const,
            }))

        return [...readyDocs, ...processingDocs]
    }, [documents, demandes])

    const user = session?.data?.user
    const userName = user?.name || "Etudiant"
    const userCne =
        typeof (user as { cne?: unknown } | undefined)?.cne === "string"
            ? (user as { cne?: string }).cne
            : null

    return (
        <main className="px-4 py-6 md:px-8 md:py-8">

            <section>
                <p className="text-[20px] font-medium uppercase tracking-wide muted-text">
                    Bon Retour,
                </p>
                <h1 className="text-[36px] font-bold leading-tight text-orange">
                    {userName}
                </h1>

                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <KpiCard
                        title="Attestation de réussite"
                        bgColor="var(--color-card-orange)"
                        imageSrc="/images/KPI/reussite.png"
                        onClick={() => router.push("/demande/nouvelle/resume?type=ATTESTATION_REUSSITE")}
                    />
                    <KpiCard
                        title="Attestation d'inscription"
                        bgColor="var(--color-card-blue)"
                        imageSrc="/images/KPI/inscription.png"
                        onClick={() => router.push("/demande/nouvelle/resume?type=ATTESTATION_INSCRIPTION")}
                    />
                    <KpiCard
                        title="Relevé de notes"
                        bgColor="var(--color-card-peach)"
                        imageSrc="/images/KPI/notes.png"
                        onClick={() => router.push("/demande/nouvelle/resume?type=RELEVE_DE_NOTES")}
                    />
                    <KpiCard
                        title="Faire une demande"
                        bgColor="transparent"
                        variant="ghost"
                        imageSrc=""
                        onClick={() => router.push("/demande/nouvelle")}
                    />
                </div>
            </section>

            <section className="mt-8">
                <h2 className="mb-5 text-[24px] font-bold" style={{ color: 'var(--color-navy)' }}>
                    Vos Documents Récents
                </h2>

                <div className="grid gap-6 min-[1200px]:grid-cols-[1fr_480px]">
                    <RecentDocuments documents={recentDocuments} />
                    <StudentCard name={userName} cne={userCne} />
                </div>
            </section>

        </main>
    )
}