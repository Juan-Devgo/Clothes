import { FormState } from '@/types/shared/forms';
import { CreateCustomerData, UpdateCustomerData } from './types';

/**
 * Errores de validación específicos para formularios de cliente
 */
export interface CustomerValidationErrors {
  first_name?: string[];
  last_name?: string[];
  email?: string[];
  phone?: string[];
  birthdate?: string[];
  tastes?: string[];
  documentId?: string[];
}

/**
 * CreateCustomerFormState: Crea un nuevo cliente con su cuenta asociada
 * Flujo: Formulario → Validación → Crear cliente → Crear cuenta
 */
export interface CreateCustomerFormState extends FormState<
  CreateCustomerData,
  CustomerValidationErrors
> {
  customerId?: string; // documentId del cliente creado
  accountId?: string; // documentId de la cuenta asociada
}

/**
 * UpdateCustomerFormState: Actualiza un cliente existente
 * Flujo: Formulario → Validación → Actualizar cliente
 */
export interface UpdateCustomerFormState extends FormState<
  UpdateCustomerData & { documentId: string },
  CustomerValidationErrors
> {}

/**
 * DeleteCustomerFormState: Elimina un cliente y su cuenta asociada
 * Flujo: Confirmación → Eliminar cuenta → Eliminar cliente
 */
export interface DeleteCustomerFormState extends FormState<
  { documentId: string },
  CustomerValidationErrors
> {}
