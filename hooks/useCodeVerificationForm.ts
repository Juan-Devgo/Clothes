'use client';

import {
  verifyUserAction,
  verifyResetPasswordCodeAction,
  clearTemporaryDataAction,
} from '@/actions/auth';
import { useAuthForm } from './useAuthForm';
import { useRouter } from 'next/navigation';
import { routes } from '@/lib/paths';
import { useState } from 'react';
import toast from 'react-hot-toast';

const MAX_INVALID_CODE_ATTEMPTS = 3;

type CodeFormType = 'verify-user' | 'reset-password';

/**
 * Hook unificado para verificación de códigos
 * Evita llamar múltiples hooks incondicionalmente
 */
export function useCodeVerificationForm(type: CodeFormType) {
  const router = useRouter();
  const [invalidCodeAttempts, setInvalidCodeAttempts] = useState(0);

  const config = {
    'verify-user': {
      action: verifyUserAction,
      successMessage: '¡Cuenta creada exitosamente!',
      successRoute: routes.LOGIN,
      errorRoute: routes.REGISTER,
      errorMessages: {
        409: 'Usted ya está registrado. Redirigiendo a inicio de sesión...',
      },
    },
    'reset-password': {
      action: verifyResetPasswordCodeAction,
      successMessage: '¡Código verificado exitosamente!',
      successRoute: routes.CHANGE_PASSWORD,
      errorRoute: routes.RESET_PASSWORD,
      errorMessages: {},
    },
  }[type];

  return useAuthForm({
    action: config.action,
    successMessage: config.successMessage,
    validationErrorMessage: 'Error de validación desconocido',
    onSuccess: async () => {
      if (type === 'reset-password') {
        router.refresh();
      }
      router.push(config.successRoute);
    },
    onCmsError: async (cmsErrors) => {
      const status = cmsErrors?.status;

      // 409: Usuario ya registrado (solo para verify-user)
      if (status === 409 && type === 'verify-user') {
        toast.error(config.errorMessages[409] || 'Usuario ya registrado.');
        await clearTemporaryDataAction();
        router.push(routes.LOGIN);
        return true;
      }

      // 400: Código inválido - contar intentos
      if (status === 400) {
        const newAttempts = invalidCodeAttempts + 1;
        setInvalidCodeAttempts(newAttempts);
        const remaining = MAX_INVALID_CODE_ATTEMPTS - newAttempts;

        if (remaining <= 0) {
          toast.error(
            type === 'verify-user'
              ? 'Ha agotado sus intentos. Debe registrarse de nuevo.'
              : 'Ha agotado sus intentos. Debe solicitar un nuevo código.'
          );
          await clearTemporaryDataAction();
          router.push(config.errorRoute);
        } else {
          toast.error(
            `Código incorrecto. Tiene ${remaining} intento${
              remaining !== 1 ? 's' : ''
            } restante${remaining !== 1 ? 's' : ''}.`
          );
        }
        return true;
      }

      // 500: Error de servidor
      if (status === 500) {
        toast.error(
          type === 'verify-user'
            ? 'Error de servidor. Intente registrarse de nuevo.'
            : 'Error de servidor. Intente solicitar un nuevo código.'
        );
        await clearTemporaryDataAction();
        router.push(config.errorRoute);
        return true;
      }

      return false;
    },
    cmsErrorMessages: {
      429: 'Ha realizado muchos intentos, intente más tarde.',
    },
  });
}
