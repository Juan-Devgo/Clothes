import ControlPanelNavbar from '@/components/control-panel-navbar';

export default async function ControlPanelLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex flex-col">
      <ControlPanelNavbar />
      <main className="flex-1 flex flex-col bg-gray-100 text-gray-800 shadow-sm rounded-xl p-4 m-2">
        {children}
      </main>
    </div>
  );
}
