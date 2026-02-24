import ControlPanelNavbar from '@/components/ui/control-panel-navbar';
import Fallback from '@/components/ui/fallback';
import { Suspense } from 'react';

export default function ControlPanelLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex flex-col">
      <ControlPanelNavbar />
      <main className="flex-1 flex flex-col bg-gray-100 text-gray-800 shadow-sm rounded-xl p-4 m-2">
        <Suspense
          fallback={<Fallback message="Cargando Panel de Control..." />}
        >
          {children}
        </Suspense>
      </main>
    </div>
  );
}
