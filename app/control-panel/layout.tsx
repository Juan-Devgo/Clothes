import ControlPanelNavbar from "@/components/ui/control-panel-navbar";
import ControlPanelFooter from "@/components/ui/control-panel-footer";

export default function ControlPanelLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-linear-to-b from-white to-[#F3B3CB]">
      {/* Área visible inicialmente: ocupa exactamente el viewport */}
      <div className="h-screen flex flex-col overflow-hidden">
        <ControlPanelNavbar />

        <main className="flex-1 flex flex-col bg-white text-gray-800 shadow-md rounded-xl border border-gray-200 p-3 sm:p-4 md:p-6 mx-2 sm:mx-4 my-2 sm:my-3 overflow-hidden">
          {children}
        </main>
      </div>

      {/* Footer fuera del viewport inicial, visible al hacer scroll */}
      <ControlPanelFooter />
    </div>
  );
}
