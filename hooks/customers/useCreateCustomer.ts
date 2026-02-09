'use client';

import { createCustomerAction } from '@/actions/customers';
import { useCustomerForm } from './useCustomerForm';
import { CreateCustomerFormState } from '@/types/customer-view/forms';

interface UseCreateCustomerConfig {
  onSuccess?: (message: string) => void | Promise<void>;
}

export function useCreateCustomer(config?: UseCreateCustomerConfig) {
  return useCustomerForm<CreateCustomerFormState>({
    action: createCustomerAction,
    successMessage: '¡Cliente creado exitosamente!',
    onSuccess: config?.onSuccess,
  });
}
