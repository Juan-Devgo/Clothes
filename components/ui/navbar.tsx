'use client';

import { logoutAction } from '@/actions/auth';
import { routes } from '@/lib/paths';
import { getCurrentUser } from '@/service/auth';
import { User } from '@/types';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      try {
        const { user: userData } = await getCurrentUser();
        setUser(userData);
      } catch {
        redirect(routes.LOGIN);
      }
    });
  }, []);

  return (
    <nav className="flex flex-row justify-between items-center p-4 bg-white shadow-md">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          [Clothes Saldos Americanos Logo]
        </h1>
      </div>
      <div className="flex gap-4">
        {isPending ? (
          <span className="text-black">Cargando usuario...</span>
        ) : !user ? (
          <>
            <Link href={routes.LOGIN}>
              <button className="rounded-2xl bg-[#F3B3CB] text-gray-800 hover:bg-[#F7D2E0] px-3 py-1 cursor-pointer transition-colors duration-300">
                Iniciar Sesión
              </button>
            </Link>
            <Link href={routes.REGISTER}>
              <button className="rounded-2xl bg-[#F3B3CB] text-gray-800 hover:bg-[#F7D2E0] px-3 py-1 cursor-pointer transition-colors duration-300">
                Regsitrarse
              </button>
            </Link>
          </>
        ) : (
          <>
            <Link href={routes.CONTROL_PANEL}>
              <button className="rounded-2xl bg-[#F3B3CB] text-gray-800 hover:bg-[#F7D2E0] px-3 py-1 cursor-pointer transition-colors duration-300">
                Panel de Control
              </button>
            </Link>
            <form action={logoutAction}>
              <button className="rounded-2xl bg-[#F3B3CB] text-gray-800 hover:bg-[#F7D2E0] px-3 py-1 cursor-pointer transition-colors duration-300">
                Cerrar Sesión
              </button>
            </form>
          </>
        )}
      </div>
    </nav>
  );
}
