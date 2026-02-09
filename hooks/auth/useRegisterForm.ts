'use client';

import { registerAction } from '@/actions/auth';
import { useAuthForm } from './useAuthForm';
import { useRouter } from 'next/navigation';
import { routes } from '@/lib/paths';

export function useRegisterForm() {
  const router = useRouter();

  return useAuthForm({
    action: registerAction,
    successMessage: '¡Cuenta creada exitosamente!',
    validationErrorMessage: 'Error de validación desconocido',
    onSuccess: async () => {
      router.push(routes.REGISTER_VERIFY_USER);
    },
    cmsErrorMessages: {
      409: 'Ya existe una cuenta con este correo electrónico.',
    },
  });
}
