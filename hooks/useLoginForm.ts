import { loginAction } from '@/actions/auth';
import { useAuthForm } from './useAuthForm';
import { useRouter } from 'next/navigation';
import { routes } from '@/lib/paths';

export function useLoginForm() {
  const router = useRouter();

  return useAuthForm({
    action: loginAction,
    successMessage: '¡Iniciaste sesión correctamente!',
    validationErrorMessage: 'Error de validación desconocido',
    onSuccess: async () => {
      router.push(routes.CONTROL_PANEL);
    },
    cmsErrorMessages: {
      400: 'Correo o contraseña incorrectos.',
    },
  });
}
