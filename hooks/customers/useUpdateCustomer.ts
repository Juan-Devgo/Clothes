'use client';

import { updateCustomerAction } from '@/actions/customers';
import { useCustomerForm } from './useCustomerForm';
import { UpdateCustomerFormState } from '@/types/customer/forms';

interface UseUpdateCustomerConfig {
  onSuccess?: (message: string) => void | Promise<void>;
}

export function useUpdateCustomer(config?: UseUpdateCustomerConfig) {
  return useCustomerForm<UpdateCustomerFormState>({
    action: updateCustomerAction,
    successMessage: '¡Cliente actualizado exitosamente!',
    onSuccess: config?.onSuccess,
  });
}
