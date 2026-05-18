import Link from 'next/link';

const links = [
    { href: '/scolarite', label: 'Tableau de bord' },
    { href: '/demandes', label: 'Demandes actives' },
    { href: '/upload-history', label: 'Historique' },
    { href: '/upload', label: 'Upload PDF' },
];

export function SidebarScolarite() {
    return (
        <nav className="p-4">
            <p className="mb-4 text-sm font-medium text-white/80">Espace Scolarite</p>
            <ul className="space-y-1">
                {links.map((item) => (
                    <li key={item.href}>
                        <Link
                            href={item.href}
                            className="block rounded px-3 py-2 text-sm hover:bg-white/10"
                        >
                            {item.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
}