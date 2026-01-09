'use client';

import { useAuthForm } from './useAuthForm';
import { useRouter } from 'next/navigation';
import { routes } from '@/lib/paths';
import { useRef } from 'react';
import toast from 'react-hot-toast';
import { clearResetPasswordDataAction, resetPasswordAction } from '@/actions/auth';

const MAX_INVALID_CODE_ATTEMPTS = 3;

// TODO: Crear estas acciones en actions/auth.ts cuando se implemente el flujo completo
// import { resetPasswordAction, clearResetPasswordDataAction } from '@/actions/auth';

export function useResetPasswordForm() {
  const router = useRouter();
  const invalidCodeAttempts = useRef(0);

  return useAuthForm({
    action: resetPasswordAction,
    successMessage: '¡Contraseña restablecida exitosamente!',
    validationErrorMessage: 'Error de validación desconocido',
    onSuccess: async () => {
      router.push(routes.RESET_PASSWORD_CODE);
    },
    onCmsError: async (cmsErrors) => {
      const status = cmsErrors?.status;

      // 400: Código inválido - contar intentos
      if (status === 400) {
        invalidCodeAttempts.current += 1;
        const remaining =
          MAX_INVALID_CODE_ATTEMPTS - invalidCodeAttempts.current;

        if (remaining <= 0) {
          toast.error(
            'Ha agotado sus intentos. Debe solicitar un nuevo código.'
          );
          await clearResetPasswordDataAction();
          router.push(routes.RESET_PASSWORD);
        } else {
          toast.error(`Código inválido. Intentos restantes: ${remaining}`);
        }
        return true;
      }

      // 404: Usuario no encontrado
      if (status === 404) {
        toast.error('Usuario no encontrado. Verifique su correo electrónico.');
        await clearResetPasswordDataAction();
        router.push(routes.RESET_PASSWORD);
        return true;
      }

      // 500: Error de servidor
      if (status === 500) {
        toast.error('Error de servidor. Intente de nuevo más tarde.');
        await clearResetPasswordDataAction();
        router.push(routes.RESET_PASSWORD);
        return true;
      }

      return false;
    },
    cmsErrorMessages: {
      429: 'Ha realizado muchos intentos, intente más tarde.',
    },
  });
}
