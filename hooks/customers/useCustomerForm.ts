'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { FormState, CmsErrors, CmsErrorMessages } from '@/types/shared/forms';

/**
 * Mensajes de error compartidos para errores del CMS
 */
const SHARED_CMS_ERROR_MESSAGES: Record<number, string> = {
  429: 'Ha realizado muchos intentos, intente más tarde.',
  500: 'Error de conexión con el servidor.',
};

const DEFAULT_CMS_ERROR_MESSAGE = 'Error desconocido. Por favor repórtelo.';

/**
 * Configuración para el hook useCustomerForm
 */
export interface UseCustomerFormConfig<T extends FormState = FormState> {
  action: (formData: FormData) => T | Promise<T>;
  onSuccess?: (message: string) => Promise<void> | void;
  /** Retorna true si ya manejó el toast, false/void para que el hook muestre el toast */
  onCmsError?: (error: CmsErrors) => boolean | void | Promise<boolean | void>;
  successMessage?: string;
  validationErrorMessage?: string;
  cmsErrorMessages?: CmsErrorMessages;
  shouldRefresh?: boolean;
}

/**
 * Hook genérico para manejar acciones de clientes (crear, actualizar, eliminar)
 * Maneja automáticamente los toasts cuando la acción termina de ejecutarse
 * Compatible con la estructura de FormData y FormState como useAuthForm
 *
 * @example
 * const { formState, handleSubmit, isPending } = useCustomerForm({
 *   action: createCustomerAction,
 *   successMessage: '¡Cliente creado exitosamente!',
 *   onSuccess: () => closeModal(),
 * });
 */
export function useCustomerForm<T extends FormState = FormState>({
  action,
  successMessage = 'Operación exitosa',
  validationErrorMessage = 'Error de validación',
  cmsErrorMessages = {},
  onSuccess,
  onCmsError,
  shouldRefresh = true,
}: UseCustomerFormConfig<T>) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formState, setFormState] = useState<T | null>(null);

  const handleSubmit = async (formData: FormData) => {
    let shouldRefreshPage = false;

    await new Promise<void>((resolve) => {
      startTransition(async () => {
        try {
          // Ejecutar la acción
          const result = await action(formData);
          setFormState(result);

          // Caso exitoso
          if (result.success) {
            toast.success(result.message || successMessage);
            await onSuccess?.(result.message || successMessage);
            shouldRefreshPage = shouldRefresh;
            resolve();
            return;
          }

          // Errores de validación
          const hasValidationErrors =
            Object.keys(result.validationErrors || {}).length > 0;
          if (hasValidationErrors) {
            toast.error(result.message || validationErrorMessage);
            resolve();
            return;
          }

          // Errores del CMS
          if (result.cmsErrors) {
            const handled = await onCmsError?.(result.cmsErrors);

            // Si onCmsError retornó true, ya manejó el toast
            if (!handled) {
              const status = result.cmsErrors?.status;
              const errorMessage =
                (status && cmsErrorMessages[status]) ||
                (status && SHARED_CMS_ERROR_MESSAGES[status]) ||
                cmsErrorMessages.default ||
                result.message ||
                DEFAULT_CMS_ERROR_MESSAGE;
              toast.error(errorMessage);
            }
          }
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : 'Error al realizar la operación';
          toast.error(message);
        } finally {
          resolve();
        }
      });
    });

    // Ejecutar router.refresh() fuera del startTransition para que funcione correctamente
    if (shouldRefreshPage) {
      router.refresh();
    }
  };

  return {
    formState,
    handleSubmit,
    isPending,
  };
}
