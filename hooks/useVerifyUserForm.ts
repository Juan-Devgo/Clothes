import { verifyUserAction, clearVerifyUserDataAction } from '@/actions/auth';
import { useAuthForm } from './useAuthForm';
import { useRouter } from 'next/navigation';
import { routes } from '@/lib/paths';
import { useRef } from 'react';
import toast from 'react-hot-toast';

const MAX_INVALID_CODE_ATTEMPTS = 3;

export function useVerifyUserForm() {
  const router = useRouter();
  const invalidCodeAttempts = useRef(0);

  return useAuthForm({
    action: verifyUserAction,
    successMessage: '¡Cuenta creada exitosamente!',
    validationErrorMessage: 'Error de validación desconocido',
    onSuccess: async () => {
      router.push(routes.LOGIN);
    },
    onCmsError: async (cmsErrors) => {
      const status = cmsErrors?.status;

      // 409: Usuario ya registrado - redirigir a login
      if (status === 409) {
        toast.error(
          'Usted ya está registrado. Redirigiendo a inicio de sesión...'
        );
        await clearVerifyUserDataAction();
        router.push(routes.LOGIN);
        return true; // Ya manejamos el toast
      }

      // 400: Código inválido - contar intentos
      if (status === 400) {
        invalidCodeAttempts.current += 1;
        const remaining =
          MAX_INVALID_CODE_ATTEMPTS - invalidCodeAttempts.current;

        if (remaining <= 0) {
          toast.error('Ha agotado sus intentos. Debe registrarse de nuevo.');
          await clearVerifyUserDataAction();
          router.push(routes.REGISTER);
        } else {
          toast.error(`Código inválido. Intentos restantes: ${remaining}`);
        }
        return true; // Ya manejamos el toast
      }

      // 500: Error de servidor - redirigir a register
      if (status === 500) {
        toast.error('Error de servidor. Intente registrarse de nuevo.');
        await clearVerifyUserDataAction();
        router.push(routes.REGISTER);
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
