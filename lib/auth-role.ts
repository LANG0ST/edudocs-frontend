import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { api } from '@/lib/api';

export type AppRole = 'STUDENT' | 'SCOLARITE' | 'SUPER_ADMIN';

const VALID_ROLES = new Set<AppRole>(['STUDENT', 'SCOLARITE', 'SUPER_ADMIN']);

type SessionResponse = {
    user?: {
        role?: string | null;
    } | null;
};

async function fetchSession(): Promise<SessionResponse | null> {
    const incomingHeaders = await headers();
    const cookie = incomingHeaders.get('cookie');

    try {
        return await api.getSession(cookie ? { cookie } : undefined);
    } catch {
        return null;
    }
}

export async function getRequestRole(): Promise<AppRole | null> {
    const session = await fetchSession();
    const roleCandidate = session?.user?.role;

    if (roleCandidate && VALID_ROLES.has(roleCandidate as AppRole)) {
        return roleCandidate as AppRole;
    }

    return null;
}

export async function requireRole(expectedRole: AppRole): Promise<AppRole> {
    const role = await getRequestRole();

    if (!role || role !== expectedRole) {
        redirect('/');
    }

    return role;
}