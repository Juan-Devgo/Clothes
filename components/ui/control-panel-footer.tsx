import Logo from "./logo";

export default function ControlPanelFooter() {
  return (
    <footer className="bg-white border border-rose-100 mx-4 mb-4 rounded-xl shadow-md">
      <div className="px-4 sm:px-6 md:px-8 py-6 sm:py-8 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {/* Marca */}
        <div className="flex flex-col gap-2">
          <Logo />
          <p className="text-slate-500 text-sm">
            Tu tienda de ropa y accesorios de confianza.
          </p>
        </div>

        {/* Ayuda */}
        <div className="flex flex-col gap-2">
          <h4 className="font-semibold text-gray-800 mb-1">Ayuda</h4>
          <a
            href="#"
            className="text-slate-500 hover:text-[#FF4F90] text-sm transition-colors"
          >
            Preguntas Frecuentes
          </a>
          <a
            href="#"
            className="text-slate-500 hover:text-[#FF4F90] text-sm transition-colors"
          >
            Soporte Técnico
          </a>
          <a
            href="#"
            className="text-slate-500 hover:text-[#FF4F90] text-sm transition-colors"
          >
            Reportar un Error
          </a>
          <a
            href="#"
            className="text-slate-500 hover:text-[#FF4F90] text-sm transition-colors"
          >
            Documentación
          </a>
        </div>

        {/* Legal */}
        <div className="flex flex-col gap-2">
          <h4 className="font-semibold text-gray-800 mb-1">Legal</h4>
          <a
            href="#"
            className="text-slate-500 hover:text-[#FF4F90] text-sm transition-colors"
          >
            Términos y Condiciones
          </a>
          <a
            href="#"
            className="text-slate-500 hover:text-[#FF4F90] text-sm transition-colors"
          >
            Política de Privacidad
          </a>
          <a
            href="#"
            className="text-slate-500 hover:text-[#FF4F90] text-sm transition-colors"
          >
            Aviso de Cookies
          </a>
        </div>
      </div>

      <div className="border-t border-rose-100 px-4 sm:px-8 py-3 flex flex-col items-center justify-center">
        <p className="text-slate-600 text-xs">Versión 0.1.0.</p>
        <p className="text-slate-600 text-xs">
          🄯 2026 Luisa Nieto Clothes Saldos Americanos.
        </p>
      </div>
    </footer>
  );
}
