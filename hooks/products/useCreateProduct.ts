'use client';

import { createProductAction } from '@/actions/products';
import { useProductForm } from './useProductForm';
import { CreateProductFormState } from '@/types/product/forms';

interface UseCreateProductConfig {
  onSuccess?: (message: string) => void | Promise<void>;
}

export function useCreateProduct(config?: UseCreateProductConfig) {
  return useProductForm<CreateProductFormState>({
    action: createProductAction,
    successMessage: '¡Producto creado exitosamente!',
    onSuccess: config?.onSuccess,
  });
}
