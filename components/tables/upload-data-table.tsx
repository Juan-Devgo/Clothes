import { UploadIcon } from "../icons/upload";

interface UploadDataTableProps {
  renderValue?: React.ReactNode;
  setUploadModalOpen: (open: boolean) => void;
}

export default function UploadDataTable({
  renderValue,
  setUploadModalOpen,
}: UploadDataTableProps) {
  return (
    <>
      <button
        className="bg-cyan-700 text-white font-semibold text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-md hover:bg-cyan-800 items-center justify-center flex gap-0.5 cursor-pointer transition-colors"
        onClick={() => setUploadModalOpen(true)}
      >
        <UploadIcon />
        <span className="hidden sm:inline">Subir Datos</span>
      </button>

      {/* Componente de subida de datos */}
      {renderValue}
    </>
  );
}
