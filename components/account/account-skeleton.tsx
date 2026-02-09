export default function AccountSkeleton() {
  return (
    <div className="w-full">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse" />
          <div>
            <div className="h-7 w-32 bg-gray-200 rounded animate-pulse mb-1" />
            <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="h-7 w-20 bg-gray-200 rounded-full animate-pulse" />
      </div>
      {/* Tabs skeleton */}
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
      {/* Content skeleton */}
      <div className="min-h-[300px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f37ca8]" />
          <span className="text-gray-500">Cargando cuenta...</span>
        </div>
      </div>
      {/* Footer skeleton */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="bg-gray-100 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-400 mb-1">
            Gustos del cliente:
          </h4>
          <p className="text-gray-400">Cargando información...</p>
        </div>
      </div>
    </div>
  );
}
