'use client';

export default function CustomersError() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-gray-800">
      <strong>Error cargando página de clientes. Vuelva a intentarlo.</strong>
      <button
        onClick={() => window.location.reload()}
        className="rounded-2xl bg-[#F7D2E0] p-1 mt-3 cursor-pointer hover:bg-[#F3B3CB] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold max-w-2xs"
      >
        Reintentar
      </button>
    </div>
  );
}
