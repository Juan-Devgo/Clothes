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
        className="bg-blue-600 text-white font-semibold text-[10px] sm:text-xs md:text-sm px-1.5 sm:px-2 md:px-3 py-1 sm:py-1.5 rounded-md hover:bg-blue-700 items-center justify-center flex gap-0.5 cursor-pointer transition-colors"
        onClick={() => setBulkEditModalOpen?.(true)}
      >
        <EditIcon />
        <span>Editar selección</span>
      </button>
      {renderValue}
    </>
  );
}
