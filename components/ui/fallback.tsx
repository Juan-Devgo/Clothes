interface FallbackProps {
  message?: string;
}

export default function Fallback({ message }: FallbackProps) {
  return (
    <div className="min-h-[300px] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f37ca8]" />
        <span className="text-gray-500">{message || 'Cargando...'}</span>
      </div>
    </div>
  );
}
