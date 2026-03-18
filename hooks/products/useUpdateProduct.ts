'use client';

import { updateProductAction } from '@/actions/products';
import { useProductForm } from './useProductForm';
import { UpdateProductFormState } from '@/types/product/forms';

interface UseUpdateProductConfig {
  onSuccess?: (message: string) => void | Promise<void>;
}

export function useUpdateProduct(config?: UseUpdateProductConfig) {
  return useProductForm<UpdateProductFormState>({
    action: updateProductAction,
    successMessage: '¡Producto actualizado exitosamente!',
    onSuccess: config?.onSuccess,
  });
}
