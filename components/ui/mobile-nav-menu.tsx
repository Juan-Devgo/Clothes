'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import MenuIcon from '../icons/menu';

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

export default function MobileNavMenu() {
  const [open, setOpen] = useState(false);
  const [menuTop, setMenuTop] = useState(0);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleToggle() {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuTop(rect.bottom + 8);
    }
    setOpen(!open);
  }

  return (
    <div ref={menuRef} className="md:hidden shrink-0">
      <button
        ref={buttonRef}
        onClick={handleToggle}
        aria-label="Abrir menú de navegación"
        aria-expanded={open}
        className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
          open
            ? 'border-pink-400 ring-2 ring-pink-400 text-pink-600'
            : 'border-gray-200 hover:ring-2 hover:ring-pink-400 text-gray-600'
        }`}
      >
        <MenuIcon />
      </button>

      {open && (
        <div
          className="fixed left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1"
          style={{ top: menuTop }}
        >
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`block px-4 py-2 text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-[#fc86b3] text-gray-800'
                    : 'hover:bg-[#f7d0df] text-gray-700'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
