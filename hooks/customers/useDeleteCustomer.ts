'use client';

import { deleteCustomerAction } from '@/actions/customers';
import { useCustomerForm } from './useCustomerForm';
import { DeleteCustomerFormState } from '@/types/customer-view/forms';

interface UseDeleteCustomerConfig {
  onSuccess?: (message: string) => void | Promise<void>;
}

export function useDeleteCustomer(config?: UseDeleteCustomerConfig) {
  return useCustomerForm<DeleteCustomerFormState>({
    action: deleteCustomerAction,
    successMessage: '¡Cliente eliminado exitosamente!',
    onSuccess: config?.onSuccess,
  });
}
