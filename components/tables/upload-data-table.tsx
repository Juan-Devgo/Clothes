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
        className="bg-cyan-700 text-white font-semibold text-[10px] sm:text-xs md:text-sm px-1.5 sm:px-2 md:px-3 py-1 sm:py-1.5 rounded-md hover:bg-cyan-800 items-center justify-center flex gap-0.5 cursor-pointer transition-colors"
        onClick={() => setUploadModalOpen(true)}
      >
        <UploadIcon />
        <span>Subir Datos</span>
      </button>

      {/* Componente de subida de datos */}
      {renderValue}
    </>
  );
}
