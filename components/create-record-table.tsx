'use client';

import AddIcon from './icons/add';

interface CreateRecordTableProps {
  renderValue: React.ReactNode;
  setCreateModalOpen: (open: boolean) => void;
}

export default function CreateRecordTable({
  renderValue,
  setCreateModalOpen,
}: CreateRecordTableProps) {
  return (
    <>
      <button
        onClick={() => setCreateModalOpen(true)}
        className="bg-green-500 text-white px-4 py-1.5 rounded-md hover:bg-green-600 items-center justify-center flex cursor-pointer transition-colors"
      >
        <AddIcon />
        Crear Nuevo Registro
      </button>

      {/* Componente de creación de registros */}
      {renderValue}
    </>
  );
}
