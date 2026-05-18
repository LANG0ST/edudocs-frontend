export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

export type DemandeStatut = "EN_ATTENTE" | "EN_TRAITEMENT" | "TERMINE" | "REJETE"

export interface DemandeSummary {
    id: string
    typeDocument: string
    statut: DemandeStatut
    createdAt: string
    motif: string
    etudiant?: {
        id: string
        name: string
        cne?: string | null
        filiere?: string | null
        classe?: string | null
        etablissement?: string | null
    } | null
    document?: {
        id: string
        cheminFichier?: string | null
    } | null
}

export interface DocumentSummary {
    id: string
    typeDocument: string
    anneeAcademique?: string | null
    semestre?: string | null
    cheminFichier?: string | null
    emissLe: string
    codeVerification: string
    statut: "ACTIF" | "REVOQUE"
    statutBlockchain: string
}

export interface DocumentPreview {
    id: string
    typeDocument: string
    anneeAcademique?: string | null
    semestre?: string | null
    emissLe: string
    codeVerification: string
    statut: "ACTIF" | "REVOQUE"
    statutBlockchain: string
    txHash?: string | null
    downloadUrl: string
    etudiant?: {
        id: string
        name: string
        cne?: string | null
        filiere?: string | null
        classe?: string | null
        etablissement?: string | null
    } | null
}

export interface CreateDemandePayload {
    typeDocument: string | null
    anneeAcademique?: string | null
    semestre?: string | null
    motif: string
}

export interface SessionResponse {
    user?: {
        role?: string | null
    } | null
}

function buildUrl(path: string) {
    if (path.startsWith("http://") || path.startsWith("https://")) {
        return path
    }

    return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`
}

async function readErrorMessage(response: Response) {
    try {
        const payload = await response.json()
        if (typeof payload?.message === "string") {
            return payload.message
        }
        if (Array.isArray(payload?.message)) {
            return payload.message.join(", ")
        }
    } catch {
        // Fall through to text parsing.
    }

    try {
        const text = await response.text()
        if (text) {
            return text
        }
    } catch {
    }

    return `Requête échouée (${response.status})`
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await fetch(buildUrl(path), {
        cache: "no-store",
        credentials: "include",
        ...init,
        headers: {
            ...(init.body ? { "Content-Type": "application/json" } : {}),
            ...(init.headers || {}),
        },
    })

    if (!response.ok) {
        throw new Error(await readErrorMessage(response))
    }

    if (response.status === 204) {
        return undefined as T
    }

    return (await response.json()) as T
}

export const api = {
    getSession: (headers?: HeadersInit) =>
        apiRequest<SessionResponse>("/api/auth/session", { headers }),
    getMesDemandes: () =>
        apiRequest<DemandeSummary[]>("/demandes/mes-demandes"),
    getAllDemandes: (limit?: number) =>
        apiRequest<DemandeSummary[]>(limit ? `/demandes?limit=${encodeURIComponent(limit)}` : '/demandes'),
    getStudents: (query: string) =>
        apiRequest<{ id: string; name: string; cne?: string }[]>(`/students?query=${encodeURIComponent(query)}`),
    getMonPortfolio: () =>
        apiRequest<DocumentSummary[]>("/documents/mon-portfolio"),
    getDocumentPreview: (id: string) =>
        apiRequest<DocumentPreview>(`/documents/${id}/apercu`),
    createDemande: (payload: CreateDemandePayload) =>
        apiRequest<void>("/demandes", {
            method: "POST",
            body: JSON.stringify(payload),
        }),
    getDocumentDownloadUrl: (id: string) =>
        `${API_BASE_URL}/documents/${id}/telecharger`,
    getDashboardData: async () => {
        const [demandes, documents] = await Promise.all([
            apiRequest<DemandeSummary[]>("/demandes/mes-demandes"),
            apiRequest<DocumentSummary[]>("/documents/mon-portfolio"),
        ])

        return { demandes, documents }
    },
}