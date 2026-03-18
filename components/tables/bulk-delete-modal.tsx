'use client';

import DeleteIcon from '../icons/delete';
import WarningIcon from '../icons/warning';

interface BulkDeleteModalProps<T> {
  /** Lista de registros a eliminar */
  records: T[];
  /** Función para obtener la etiqueta visible de cada registro */
  getRecordLabel: (record: T) => string;
  /** Nombre de la entidad en plural (ej: "clientes") */
  entityName: string;
  /** Si hay una operación en curso */
  isPending: boolean;
  /** Callback al confirmar la eliminación */
  onConfirm: () => void;
  /** Callback al cancelar */
  onClose: () => void;
}

export default function BulkDeleteModal<T>({
  records,
  getRecordLabel,
  entityName,
  isPending,
  onConfirm,
  onClose,
}: BulkDeleteModalProps<T>) {
  return (
    <div className="flex flex-col items-center gap-4 py-2">
      {/* Ícono de advertencia */}
      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
        <WarningIcon />
      </div>

      <h3 className="text-lg font-semibold text-gray-900">
        Confirmar eliminación masiva
      </h3>

      <p className="text-gray-500 text-sm text-center max-w-md">
        ¿Estás seguro de que deseas eliminar{' '}
        <strong className="text-gray-800">{records.length}</strong>{' '}
        {entityName}? Esta acción no se puede deshacer.
      </p>

      {/* Lista de registros */}
      <div className="w-full max-h-48 overflow-auto bg-gray-50 border border-gray-200 rounded-lg">
        <div className="px-4 py-2 border-b border-gray-200">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Registros seleccionados ({records.length})
          </p>
        </div>
        <ul className="divide-y divide-gray-100">
          {records.map((record, i) => (
            <li
              key={i}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700"
            >
              <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-medium shrink-0">
                {i + 1}
              </span>
              <span className="truncate">{getRecordLabel(record)}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Botones */}
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
          className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <DeleteIcon />
          )}
          {isPending ? 'Eliminando...' : `Eliminar ${records.length} registros`}
        </button>
      </div>
    </div>
  );
}
