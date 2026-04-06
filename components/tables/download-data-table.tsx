import { DownloadIcon } from "../icons/download";

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
        className="bg-indigo-600 text-white font-semibold text-[10px] sm:text-xs md:text-sm px-1.5 sm:px-2 md:px-3 py-1 sm:py-1.5 rounded-md hover:bg-indigo-700 items-center justify-center flex gap-0.5 cursor-pointer transition-colors"
        onClick={() => setDownloadModalOpen?.(true)}
      >
        <DownloadIcon />
        <span>Descargar Datos</span>
      </button>

      {/* Componente de descarga de datos */}
      {renderValue}
    </>
  );
}
