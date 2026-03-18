'use client';

import { DownloadIcon } from '../icons/download';

interface DownloadDataModalProps {
  /** Número de registros que se van a descargar */
  recordCount: number;
  /** Nombre de la entidad para mostrar en la UI */
  entityName: string;
  /** Si hay una descarga en curso */
  isPending: boolean;
  /** Callback al confirmar la descarga */
  onConfirm: () => void;
  /** Callback al cancelar / cerrar el modal */
  onClose: () => void;
}

export default function DownloadDataModal({
  recordCount,
  entityName,
  isPending,
  onConfirm,
  onClose,
}: DownloadDataModalProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-2">
      <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
        <DownloadIcon className="w-8 h-8 text-indigo-600" />
      </div>

      <h3 className="text-lg font-semibold text-gray-900">
        Confirmar descarga
      </h3>

      <p className="text-gray-500 text-sm text-center max-w-md">
        Se exportarán{' '}
        <strong className="text-gray-800">{recordCount}</strong> registros de{' '}
        {entityName.toLowerCase()} a un archivo Excel (.xlsx). ¿Desea continuar?
      </p>

      <div className="flex gap-3 w-full">
        <button
          type="button"
          onClick={onClose}
          disabled={isPending}
          className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isPending}
          className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <DownloadIcon className="w-5 h-5" />
          )}
          Descargar {recordCount} registros
        </button>
      </div>
    </div>
  );
}
