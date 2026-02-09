import DeleteIcon from './icons/delete';
import WarningIcon from './icons/warning';

interface DeleteObjectFormProps {
  name: string;
  onDelete: () => void;
  onCancel?: () => void;
}

export default function DeleteObjectForm({
  name,
  onDelete,
  onCancel,
}: DeleteObjectFormProps) {
  function handleDelete(e: React.FormEvent) {
    e.preventDefault();
    onDelete();
  }

  return (
    <form
      onSubmit={handleDelete}
      className="flex flex-col items-center text-center"
    >
      {/* Ícono de advertencia */}
      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
        <WarningIcon />
      </div>

      {/* Título */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Confirmar eliminación
      </h3>

      {/* Mensaje */}
      <p className="text-gray-500 mb-4">
        ¿Estás seguro de que deseas eliminar este registro? Esta acción no se
        puede deshacer.
      </p>

      {/* Registro seleccionado */}
      <div className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 mb-6">
        <p className="text-sm text-gray-500">Registro seleccionado</p>
        <p className="font-medium text-gray-900 truncate">{name}</p>
      </div>

      {/* Botones */}
      <div className="flex gap-3 w-full">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium cursor-pointer"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2 cursor-pointer"
        >
          <DeleteIcon />
          Eliminar
        </button>
      </div>
    </form>
  );
}
