'use client';

import { deleteProductAction } from '@/actions/products';
import { useProductForm } from './useProductForm';
import { DeleteProductFormState } from '@/types/product/forms';

interface UseDeleteProductConfig {
  onSuccess?: (message: string) => void | Promise<void>;
}

export function useDeleteProduct(config?: UseDeleteProductConfig) {
  return useProductForm<DeleteProductFormState>({
    action: deleteProductAction,
    successMessage: '¡Producto eliminado exitosamente!',
    onSuccess: config?.onSuccess,
  });
}
