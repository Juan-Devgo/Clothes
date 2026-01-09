'use client';

import { changePasswordAction } from '@/actions/auth';
import { useAuthForm } from './useAuthForm';
import { useRouter } from 'next/navigation';
import { routes } from '@/lib/paths';

export function useChangePasswordForm() {
  const router = useRouter();

  return useAuthForm({
    action: changePasswordAction,
    successMessage: '¡Contraseña cambiada exitosamente!',
    validationErrorMessage: 'Error de validación.',
    onSuccess: async () => {
      router.push(routes.LOGIN);
    },
    cmsErrorMessages: {
      400: 'El código es inválido o ha expirado.',
      500: 'Error del servidor. Intenta de nuevo más tarde.',
    },
  });
}
