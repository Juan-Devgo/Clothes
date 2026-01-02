import { getUserDataVerifyCode } from '@/service/auth';
import { redirect } from 'next/navigation';
import { routes } from '@/lib/paths';
import VerifyUserForm from '@/components/verify-user-form';

export default async function VerifyUser() {
  const userData = await getUserDataVerifyCode('auth-register');

  if (!userData?.email) {
    redirect(routes.REGISTER);
  }

  return (
    <main className="bg-white min-h-screen flex flex-col items-center justify-center text-gray-800">
      <div className="rounded-3xl border border-gray-200 shadow-2xl w-96">
        <div className="text-center my-4 mx-2">
          <h1 className="text-4xl">Ingresa el Código que te Compartieron</h1>
          <p className="text-md text-gray-800 mt-1">
            El administrador recibió un correo con el código{' '}
            <strong>para verificar tu cuenta.</strong>
          </p>
        </div>
        <VerifyUserForm
          email={userData.email}
          username={userData.username}
          password={userData.password}
        />
      </div>
    </main>
  );
}
