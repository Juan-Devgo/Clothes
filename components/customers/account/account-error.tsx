export default function AcoountError() {
  return (
    <div className="w-full">
      {/* Header placeholder */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
            <span className="text-red-500 text-xl">!</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Error al cargar
            </h3>
            <p className="text-sm text-gray-500">
              No se pudo obtener la información
            </p>
          </div>
        </div>
      </div>
      {/* Tabs placeholder */}
      <div className="border-b border-gray-200 mb-4">
        <div className="flex gap-1">
          {['Pagos', 'Productos', 'Ventas', 'Eventos'].map((tab) => (
            <div
              key={tab}
              className="px-4 py-2.5 text-sm font-medium text-gray-300 rounded-t-lg"
            >
              {tab}
            </div>
          ))}
        </div>
      </div>
      {/* Error content */}
      <div className="min-h-[300px] flex items-center justify-center">
        <p className="text-gray-500">
          No se pudo cargar la información de la cuenta.
        </p>
      </div>
      {/* Footer placeholder */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="bg-gray-100 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-400 mb-1">
            Gustos del cliente:
          </h4>
          <p className="text-gray-400">Información no disponible</p>
        </div>
      </div>
    </div>
  );
}
