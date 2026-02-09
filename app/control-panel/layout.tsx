import ControlPanelNavbar from '@/components/control-panel-navbar';
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
          fallback={
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
            </div>
          }
        >
          {children}
        </Suspense>
      </main>
    </div>
  );
}
