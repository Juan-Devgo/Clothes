'use client';

import { useTransition } from 'react';
import toast from 'react-hot-toast';
import { deleteProductsBulkAction } from '@/actions/products';

interface UseBulkDeleteProductsConfig {
  onSuccess?: () => void;
}

export function useBulkDeleteProducts(config?: UseBulkDeleteProductsConfig) {
  const [isPending, startTransition] = useTransition();

  async function handleDelete(documentIds: string[]) {
    if (!documentIds.length) {
      toast.error('No hay registros seleccionados.');
      return;
    }

    await new Promise<void>((resolve) => {
      startTransition(async () => {
        try {
          const result = await deleteProductsBulkAction(documentIds);

          if (result.success) {
            toast.success(result.message || `${result.deleted ?? 0} productos eliminados.`);
            config?.onSuccess?.();
          } else {
            toast.error(result.message || 'Error al eliminar los registros.');
          }
        } catch {
          toast.error('Error al eliminar los registros.');
        } finally {
          resolve();
        }
      });
    });
  }

  return { handleDelete, isPending };
}
