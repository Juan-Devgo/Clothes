import EditIcon from "../icons/edit";

export default function BulkEditTable({
  renderValue,
  setBulkEditModalOpen,
}: {
  renderValue: React.ReactNode;
  setBulkEditModalOpen: (value: boolean) => void;
}) {
  return (
    <>
      <button
        className="bg-blue-600 text-white font-semibold text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-md hover:bg-blue-700 items-center justify-center flex gap-0.5 cursor-pointer transition-colors"
        onClick={() => setBulkEditModalOpen?.(true)}
      >
        <EditIcon />
        <span className="hidden sm:inline">Editar selección</span>
      </button>
      {renderValue}
    </>
  );
}
