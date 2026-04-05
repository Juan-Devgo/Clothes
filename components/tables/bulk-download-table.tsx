import { DownloadIcon } from "../icons/download";

export default function BulkDownloadTable({
  renderValue,
  setBulkDownloadModalOpen,
}: {
  renderValue: React.ReactNode;
  setBulkDownloadModalOpen: (open: boolean) => void;
}) {
  return (
    <>
      <button
        className="bg-indigo-600 text-white font-semibold text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-md hover:bg-indigo-700 items-center justify-center flex gap-0.5 cursor-pointer transition-colors"
        onClick={() => setBulkDownloadModalOpen?.(true)}
      >
        <DownloadIcon />
        <span className="hidden sm:inline">Descargar selección</span>
      </button>
      {renderValue}
    </>
  );
}