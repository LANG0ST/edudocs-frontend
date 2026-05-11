import Link from 'next/link';

const links = [{ href: '/utilisateurs', label: 'Utilisateurs' }];

export function SidebarAdmin() {
    return (
        <nav className="p-4">
            <p className="mb-4 text-sm font-medium text-white/80">Espace Administration</p>
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