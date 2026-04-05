import DeleteIcon from "../icons/delete";

export default function BulkDeleteTable({
  renderValue,
  setBulkDeleteModalOpen,
}: {
  renderValue: React.ReactNode;
  setBulkDeleteModalOpen: (open: boolean) => void;
}) {
  return (
    <>
      <button
        className="bg-red-500 text-white font-semibold text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-md hover:bg-red-600 items-center justify-center flex gap-0.5 cursor-pointer transition-colors"
        onClick={() => setBulkDeleteModalOpen?.(true)}
      >
        <DeleteIcon />
        <span className="hidden sm:inline">Eliminar selección</span>
      </button>
      {renderValue}
    </>
  );
}
