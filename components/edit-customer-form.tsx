'use client';

import { Customer } from '@/types';
import PersonIcon from './icons/person';
import PhoneIcon from './icons/phone';
import EmailIcon from './icons/email';
import CalendarIcon from './icons/calendar';
import HeartIcon from './icons/heart';
import CheckedIcon from './icons/checked';
import FormError from './ui/form-error';
import { useCreateCustomer, useUpdateCustomer } from '@/hooks/customers';

interface EditCustomerFormProps {
  type: 'edit' | 'create';
  customer: Customer;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function EditCustomerForm({
  type,
  customer,
  onSuccess,
  onCancel,
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

  const isPending = isCreating || isUpdating;
  const isCreate = type === 'create';
  const formState = isCreate ? createFormState : updateFormState;

  // Colores dinámicos según el tipo
  const iconBg = isCreate ? 'bg-green-100' : 'bg-blue-100';
  const iconColor = isCreate ? 'green-600' : 'blue-600';
  const focusRing = isCreate ? 'focus:ring-green-500' : 'focus:ring-blue-500';
  const buttonBg = isCreate ? 'bg-green-600' : 'bg-blue-600';
  const buttonHover = isCreate ? 'hover:bg-green-700' : 'hover:bg-blue-700';
  const buttonText = isCreate ? 'Crear Cliente' : 'Guardar Cambios';

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        if (isCreate) {
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
            disabled={isPending}
            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="Ej: María"
            required
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
            disabled={isPending}
            className={`px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 ${focusRing} focus:border-transparent focus:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
            placeholder="Ej: García"
            required
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
              disabled={isPending}
              className={`w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 ${focusRing} focus:border-transparent focus:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
              placeholder="Ej: +57 300 123 4567"
              required
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
              disabled={isPending}
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
              <CalendarIcon />
            </span>
            <input
              type="date"
              id="birthdate"
              name="birthdate"
              defaultValue={customer.birthdate || ''}
              disabled={isPending}
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
              disabled={isPending}
              rows={3}
              className={`w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 ${focusRing} focus:border-transparent focus:bg-white transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed`}
              placeholder="Preferencias de productos, estilo, tallas, colores, etc."
            />
          </div>
          <FormError errors={formState?.validationErrors?.tastes} />
        </div>

        {/* Botones */}
        <div className="md:col-span-2 flex justify-end gap-3 mt-2 pt-4 border-t border-gray-100">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isPending}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={isPending}
            className={`px-6 py-2.5 ${buttonBg} text-white rounded-lg ${buttonHover} transition-colors font-medium flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
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
