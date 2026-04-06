'use client';

import { useTransition } from 'react';
import toast from 'react-hot-toast';
import { updateProductsBulkAction } from '@/actions/products';

interface UseBulkEditProductsConfig {
  documentIds: string[];
  onSuccess?: () => void;
}

export function useBulkEditProducts(config: UseBulkEditProductsConfig) {
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    if (!config.documentIds.length) {
      toast.error('No hay registros seleccionados.');
      return;
    }

    // Extraer solo los campos enviados (los campos habilitados del formulario)
    const data: Record<string, string | number> = {};
    for (const [key, value] of formData.entries()) {
      if (key !== 'documentId' && typeof value === 'string' && value.trim() !== '') {
        // Convertir campos numéricos
        if (key === 'price' || key === 'stock') {
          const num = Number(value);
          if (!isNaN(num)) data[key] = num;
        } else {
          data[key] = value.trim();
        }
      }
    }

    if (!Object.keys(data).length) {
      toast.error('No hay cambios para aplicar.');
      return;
    }

    await new Promise<void>((resolve) => {
      startTransition(async () => {
        try {
          const result = await updateProductsBulkAction(
            config.documentIds,
            data as Parameters<typeof updateProductsBulkAction>[1],
          );

          if (result.success) {
            toast.success(result.message || `${result.created ?? 0} productos actualizados.`);
            config.onSuccess?.();
          } else {
            toast.error(result.message || 'Error al actualizar los registros.');
          }
        } catch {
          toast.error('Error al actualizar los registros.');
        } finally {
          resolve();
        }
      });
    });
  }

  return { handleSubmit, isPending };
}
