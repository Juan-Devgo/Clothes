import ChangePasswordForm from '@/components/change-password-form';
import { routes } from '@/lib/paths';
import { getUserDataVerifyCode } from '@/service/auth';
import { redirect } from 'next/navigation';

export default async function ChangePassword() {
  const userData = await getUserDataVerifyCode('reset-password');

  if (!userData?.email || !userData?.code) {
    redirect(routes.RESET_PASSWORD);
  }

  return (
    <main className="bg-white min-h-screen flex flex-col items-center justify-center text-gray-800">
      <div className="rounded-3xl border border-gray-200 shadow-2xl w-96">
        <div className="text-center my-4 mx-2">
          <h1 className="text-4xl">Cambia tu Contraseña</h1>
          <p className="text-md text-gray-800 mt-1">
            Ingresa tu nueva contraseña para restablecer tu contraseña.
          </p>
        </div>
        <ChangePasswordForm email={userData.email} code={userData.code} />
      </div>
    </main>
  );
}
