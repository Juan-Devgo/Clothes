'use client';

import {
  verifyResetPasswordCodeAction,
  clearTemporaryDataAction,
} from '@/actions/auth';
import { useAuthForm } from './useAuthForm';

import { useRouter } from 'next/navigation';
import { routes } from '@/lib/paths';
import { useState } from 'react';
import toast from 'react-hot-toast';

const MAX_INVALID_CODE_ATTEMPTS = 3;

export function useVerifyResetPasswordForm() {
  const router = useRouter();
  const [invalidCodeAttempts, setInvalidCodeAttempts] = useState(0);

  return useAuthForm({
    action: verifyResetPasswordCodeAction,
    successMessage: '¡Código verificado exitosamente!',
    validationErrorMessage: 'Error de validación desconocido',
    onSuccess: async () => {
      // refresh() asegura que las cookies actualizadas por la Server Action
      // estén disponibles antes de navegar a la página de cambiar contraseña
      router.refresh();
      router.push(routes.CHANGE_PASSWORD);
    },
    onCmsError: async (cmsErrors) => {
      const status = cmsErrors?.status;

      // 400: Código inválido - contar intentos
      if (status === 400) {
        const newAttempts = invalidCodeAttempts + 1;
        setInvalidCodeAttempts(newAttempts);
        const remaining = MAX_INVALID_CODE_ATTEMPTS - newAttempts;

        if (remaining <= 0) {
          toast.error(
            'Ha agotado sus intentos. Debe solicitar un nuevo código.'
          );
          await clearTemporaryDataAction();
          router.push(routes.RESET_PASSWORD);
        } else {
          toast.error(
            `Código incorrecto. Tiene ${remaining} intento${
              remaining !== 1 ? 's' : ''
            } restante${remaining !== 1 ? 's' : ''}.`
          );
        }
        return true; // Ya manejamos el toast
      }

      // 500: Error de servidor - redirigir a reset-password
      if (status === 500) {
        toast.error('Error de servidor. Intente solicitar un nuevo código.');
        await clearTemporaryDataAction();
        router.push(routes.RESET_PASSWORD);
        return true; // Ya manejamos el toast
      }

      // Para otros códigos (como 429), retornamos false para que useAuthForm maneje el toast
      return false;
    },
    // El 429 se maneja con el mensaje compartido en useAuthForm
    cmsErrorMessages: {
      429: 'Ha realizado muchos intentos, intente más tarde.',
    },
  });
}
