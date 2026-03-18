'use client';

import { Customer } from '@/types';

import { useCreateCustomer, useUpdateCustomer } from '@/hooks/customers';
import FormError from '@/components/ui/form-error';
import PhoneIcon from '@/components/icons/phone';
import EmailIcon from '@/components/icons/email';
import CakeIcon from '@/components/icons/cake';
import HeartIcon from '@/components/icons/heart';
import PersonIcon from '@/components/icons/person';
import CheckedIcon from '@/components/icons/checked';

interface EditCustomerFormProps {
  type: 'edit' | 'create';
  customer: Customer;
  onSuccess?: () => void;
  onCancel?: () => void;
  /** Si se especifica, solo estos campos estarán habilitados (para edición masiva) */
  enabledFields?: string[];
  /** Submit personalizado para edición masiva (reemplaza el submit normal) */
  onBulkSubmit?: (formData: FormData) => void;
  /** Número de registros que se actualizarán (para el texto del botón) */
  bulkRecordCount?: number;
  /** Estado de carga externo (ej: hook de edición masiva) */
  isPendingExternal?: boolean;
}

export default function EditCustomerForm({
  type,
  customer,
  onSuccess,
  onCancel,
  enabledFields,
  onBulkSubmit,
  bulkRecordCount,
  isPendingExternal = false,
}: EditCustomerFormProps) {
  // Hooks para crear y actualizar
  const {
    formState: createFormState,
    handleSubmit: handleCreate,
    isPending: isCreating,
  } = useCreateCustomer({
    onSuccess,
  });

  const {
    formState: updateFormState,
    handleSubmit: handleUpdate,
    isPending: isUpdating,
  } = useUpdateCustomer({
    onSuccess,
  });

  const isPending = isCreating || isUpdating || isPendingExternal;
  const isCreate = type === 'create';
  const formState = isCreate ? createFormState : updateFormState;

  // Un campo está habilitado si enabledFields no está definido O si está en la lista
  const isFieldEnabled = (fieldName: string) =>
    enabledFields === undefined || enabledFields.includes(fieldName);

  // Colores dinámicos según el tipo
  const iconBg = isCreate ? 'bg-green-100' : 'bg-blue-100';
  const iconColor = isCreate ? 'green-600' : 'blue-600';
  const focusRing = isCreate ? 'focus:ring-green-500' : 'focus:ring-blue-500';
  const buttonBg = isCreate ? 'bg-green-600' : 'bg-blue-600';
  const buttonHover = isCreate ? 'hover:bg-green-700' : 'hover:bg-blue-700';
  const buttonText = bulkRecordCount
    ? `Guardar en ${bulkRecordCount} registros`
    : isCreate
      ? 'Crear Cliente'
      : 'Guardar Cambios';

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        if (onBulkSubmit) {
          onBulkSubmit(formData);
        } else if (isCreate) {
          handleCreate(formData);
        } else {
          handleUpdate(formData);
        }
      }}
      className="w-full"
    >
      {/* Campo oculto para documentId en modo edición */}
      {!isCreate && customer.documentId && (
        <input
          type="hidden"
          name="documentId"
          defaultValue={customer.documentId}
        />
      )}

      {/* Ícono de usuario */}
      <div className="flex justify-center mb-6">
        <div
          className={`w-16 h-16 rounded-full ${iconBg} flex items-center justify-center`}
        >
          <PersonIcon size="8" color={iconColor} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Nombre */}
        <div className="flex flex-col">
          <label
            htmlFor="first_name"
            className="text-sm font-medium text-gray-600 mb-1.5"
          >
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="first_name"
            name="first_name"
            defaultValue={customer.first_name}
            disabled={isPending || !isFieldEnabled('first_name')}
            className={`px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 ${focusRing} focus:border-transparent focus:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
            placeholder="Ej: María"
            required={isFieldEnabled('first_name')}
          />
          <FormError errors={formState?.validationErrors?.first_name} />
        </div>

        {/* Apellido */}
        <div className="flex flex-col">
          <label
            htmlFor="last_name"
            className="text-sm font-medium text-gray-600 mb-1.5"
          >
            Apellido <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="last_name"
            name="last_name"
            defaultValue={customer.last_name}
            disabled={isPending || !isFieldEnabled('last_name')}
            className={`px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 ${focusRing} focus:border-transparent focus:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
            placeholder="Ej: García"
            required={isFieldEnabled('last_name')}
          />
          <FormError errors={formState?.validationErrors?.last_name} />
        </div>

        {/* Teléfono */}
        <div className="flex flex-col">
          <label
            htmlFor="phone"
            className="text-sm font-medium text-gray-600 mb-1.5"
          >
            Teléfono <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <PhoneIcon />
            </span>
            <input
              type="tel"
              id="phone"
              name="phone"
              defaultValue={customer.phone}
              disabled={isPending || !isFieldEnabled('phone')}
              className={`w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 ${focusRing} focus:border-transparent focus:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
              placeholder="Ej: +57 300 123 4567"
              required={isFieldEnabled('phone')}
            />
          </div>
          <FormError errors={formState?.validationErrors?.phone} />
        </div>

        {/* Email */}
        <div className="flex flex-col">
          <label
            htmlFor="email"
            className="text-sm font-medium text-gray-600 mb-1.5"
          >
            Email
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <EmailIcon />
            </span>
            <input
              type="email"
              id="email"
              name="email"
              defaultValue={customer.email || ''}
              disabled={isPending || !isFieldEnabled('email')}
              className={`w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 ${focusRing} focus:border-transparent focus:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
              placeholder="Ej: maria@email.com"
            />
          </div>
          <FormError errors={formState?.validationErrors?.email} />
        </div>

        {/* Fecha de nacimiento */}
        <div className="flex flex-col">
          <label
            htmlFor="birthdate"
            className="text-sm font-medium text-gray-600 mb-1.5"
          >
            Fecha de nacimiento
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <CakeIcon />
            </span>
            <input
              type="date"
              id="birthdate"
              name="birthdate"
              defaultValue={customer.birthdate || ''}
              disabled={isPending || !isFieldEnabled('birthdate')}
              className={`w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 ${focusRing} focus:border-transparent focus:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
            />
          </div>
          <FormError errors={formState?.validationErrors?.birthdate} />
        </div>

        {/* Gustos/Preferencias */}
        <div className="flex flex-col md:col-span-2">
          <label
            htmlFor="tastes"
            className="text-sm font-medium text-gray-600 mb-1.5"
          >
            Gustos/Preferencias
          </label>
          <div className="relative">
            <span className="absolute left-4 top-3 text-gray-400">
              <HeartIcon />
            </span>
            <textarea
              id="tastes"
              name="tastes"
              defaultValue={customer.tastes || ''}
              disabled={isPending || !isFieldEnabled('tastes')}
              rows={3}
              className={`w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 ${focusRing} focus:border-transparent focus:bg-white transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed`}
              placeholder="Preferencias de productos, estilo, tallas, colores, etc."
            />
          </div>
          <FormError errors={formState?.validationErrors?.tastes} />
        </div>

        {/* Botones */}
        <div className="flex gap-3 w-full md:col-span-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isPending}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={isPending}
            className={`flex-1 px-4 py-2.5 ${buttonBg} text-white rounded-lg ${buttonHover} transition-colors font-medium flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isPending ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <CheckedIcon />
            )}
            {isPending ? 'Procesando...' : buttonText}
          </button>
        </div>
      </div>
    </form>
  );
}
