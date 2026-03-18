'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { updateCustomersBulkAction } from '@/actions/customers';

interface UseBulkEditCustomersConfig {
  documentIds: string[];
  onSuccess?: () => void;
}

export function useBulkEditCustomers(config: UseBulkEditCustomersConfig) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    if (!config.documentIds.length) {
      toast.error('No hay registros seleccionados.');
      return;
    }

    // Extraer solo los campos enviados (los campos habilitados del formulario)
    const data: Record<string, string> = {};
    for (const [key, value] of formData.entries()) {
      if (key !== 'documentId' && typeof value === 'string' && value.trim() !== '') {
        data[key] = value.trim();
      }
    }

    if (!Object.keys(data).length) {
      toast.error('No hay cambios para aplicar.');
      return;
    }

    await new Promise<void>((resolve) => {
      startTransition(async () => {
        try {
          const result = await updateCustomersBulkAction(config.documentIds, data);

          if (result.success) {
            toast.success(result.message || `${result.created ?? 0} clientes actualizados.`);
            config.onSuccess?.();
            router.refresh();
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
