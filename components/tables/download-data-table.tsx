import { DownloadIcon } from '../icons/download';

interface DownloadDataTableProps {
  renderValue?: React.ReactNode;
  setDownloadModalOpen?: (open: boolean) => void;
}

export default function DownloadDataTable({
  renderValue,
  setDownloadModalOpen,
}: DownloadDataTableProps) {
  return (
    <>
      <button
        className="bg-indigo-500 text-white font-semibold px-3 py-1.5 rounded-md hover:bg-indigo-600 items-center justify-center flex gap-0.5 cursor-pointer transition-colors"
        onClick={() => setDownloadModalOpen?.(true)}
      >
        <DownloadIcon />
        Descargar Datos
      </button>

      {/* Componente de descarga de datos */}
      {renderValue}
    </>
  );
}
