import { FormState, UseAuthFormConfig } from '@/types/auth/forms';
import { useState, useTransition } from 'react';
import toast from 'react-hot-toast';

/**
 * Hook genérico para manejar acciones de autenticación (registro, login, etc)
 * Maneja automáticamente los toasts cuando la acción termina de ejecutarse
 *
 * @example
 * const { formState, handleSubmit, isPending } = useAuthForm({
 *   action: loginAction,
 *   onSuccess: async () => router.push('/dashboard'),
 *   successMessage: '¡Iniciaste sesión correctamente!',
 * });
 */
const SHARED_CMS_ERROR_MESSAGES: Record<number, string> = {
  429: 'Ha realizado muchos intentos, intente más tarde.',
};

const DEFAULT_CMS_ERROR_MESSAGE = 'Error desconocido. Por favor repórtelo.';

export function useAuthForm<T extends FormState = FormState>({
  action,
  onSuccess,
  onCmsError,
  successMessage = 'Operación exitosa',
  validationErrorMessage = 'Error de validación desconocido',
  cmsErrorMessages = {},
}: UseAuthFormConfig<T>) {
  const [isPending, startTransition] = useTransition();
  const [formState, setFormState] = useState<T | null>(null);

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      // Ejecutar la acción
      const result = await action(formData);
      setFormState(result);

      // Caso exitoso
      if (result.success) {
        toast.success(result.message || successMessage);
        await onSuccess?.(result.message || successMessage);
        return;
      }

      // Errores de validación
      const hasValidationErrors =
        Object.keys(result.validationErrors || {}).length > 0;
      if (hasValidationErrors) {
        toast.error(result.message || validationErrorMessage);
        return;
      }

      // Errores del CMS
      if (result.cmsErrors) {
        const handled = await onCmsError?.(result.cmsErrors);

        // Si onCmsError retornó true, ya manejó el toast
        if (handled) return;

        const status = result.cmsErrors?.status;
        const errorMessage =
          (status && cmsErrorMessages[status]) ||
          (status && SHARED_CMS_ERROR_MESSAGES[status]) ||
          cmsErrorMessages.default ||
          DEFAULT_CMS_ERROR_MESSAGE;
        toast.error(errorMessage);
      }
    });
  };

  return {
    formState,
    handleSubmit,
    isPending,
  };
}
