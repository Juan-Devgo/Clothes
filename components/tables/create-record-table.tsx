"use client";

import AddIcon from "../icons/add";

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
        className="bg-green-700 text-white font-semibold text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-md hover:bg-green-800 items-center justify-center flex gap-0.5 cursor-pointer transition-colors"
      >
        <AddIcon />
        <span className="hidden sm:inline">Crear Nuevo</span>
      </button>

      {/* Componente de creación de registros */}
      {renderValue}
    </>
  );
}
