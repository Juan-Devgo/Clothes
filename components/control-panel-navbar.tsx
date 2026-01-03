import { Suspense } from 'react';
import AuthenticatedUser from './ui/authenticated-user';
import LoadingAuthenticatedUser from './ui/loading-authenticated-user';
import NavLinks from './ui/control-panel-nav-links';
import Link from 'next/link';

const links = [
  { href: '/control-panel', label: 'Dashboard' },
  { href: '/control-panel/customers', label: 'Clientes' },
  { href: '/control-panel/sales', label: 'Ventas' },
  { href: '/control-panel/products', label: 'Productos' },
  { href: '/control-panel/messages', label: 'Mensajes' },
  { href: '/control-panel/promos', label: 'Promociones' },
  { href: '/control-panel/events', label: 'Eventos' },
  { href: '/control-panel/supplies', label: 'Insumos' },
];

export default function ControlPanelNavbar() {
  return (
    <nav className="flex flex-row justify-between items-center p-4 m-2 bg-gray-100 text-gray-800 shadow-sm rounded-xl">
      <div>
        <Link href="/">
          <h1 className="text-xl">
            [Clothes Saldos Americanos Logo]
          </h1>
        </Link>
      </div>
      <div>
        <NavLinks links={links} />
      </div>
      <Suspense fallback={<LoadingAuthenticatedUser />}>
        <AuthenticatedUser />
      </Suspense>
    </nav>
  );
}
