import { UploadIcon } from '../icons/upload';

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
        className="bg-cyan-500 text-white font-semibold px-3 py-1.5 rounded-md hover:bg-cyan-600 items-center justify-center flex gap-0.5 cursor-pointer transition-colors"
        onClick={() => setUploadModalOpen(true)}
      >
        <UploadIcon />
        Subir Datos
      </button>

      {/* Componente de subida de datos */}
      {renderValue}
    </>
  );
}
