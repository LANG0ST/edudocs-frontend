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

        if (readyDocs.length >= 3) {
            return readyDocs
        }

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

    return (
        <div className="dashboard-canvas flex h-screen w-full overflow-hidden pb-20 md:pb-0">
            <main className="flex-1 overflow-y-auto px-4 py-6 md:py-8">
                <section>
                    <p className="text-[20px] font-medium uppercase tracking-wide muted-text">Bon Retour,</p>
                    <h1 className="text-[36px] font-bold leading-tight text-orange">{user?.name || "Etudiant"}</h1>

                    <div className="mt-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
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

                <section className="mt-8 grid gap-6 md:grid-cols-5">
                    <div className="md:col-span-5 my-5">
                        <h2 className="text-[24px] font-bold">Vos Documents Récents</h2>
                    </div>
                    <div className="md:col-span-3">
                        <RecentDocuments documents={recentDocuments} />
                    </div>
                    <div className="md:col-span-2">
                        <StudentCard />
                    </div>
                </section>
            </main>
        </div>
    )
}
