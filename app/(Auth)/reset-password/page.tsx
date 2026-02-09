'use client';

import { useResetPasswordForm } from '@/hooks/auth/useResetPasswordForm';

export default function ResetPassword() {
  const { formState, handleSubmit, isPending } = useResetPasswordForm();

  return (
    <main className="bg-white min-h-screen flex flex-col items-center justify-center text-gray-800">
      <div className="rounded-3xl border border-gray-200 shadow-2xl w-96 transition-opacity duration-300">
        <div className="text-center my-4 mx-2">
          <h1 className="text-4xl">¿Olvidaste tu Constraseña?</h1>
          <p className="text-md text-gray-800 mt-1">
            Ingresa tu correo electrónico para recibir un{' '}
            <strong>código de restablecimiento.</strong>
          </p>
        </div>
        <form
          className="flex flex-col gap-2 my-4 px-6"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(new FormData(e.currentTarget));
          }}
        >
          <label htmlFor="email">Correo Electrónico</label>
          <input
            type="email"
            id="email"
            name="email"
            required
            disabled={isPending}
            defaultValue={formState?.data?.email ?? ''}
            className="rounded border border-black"
          />
          <button
            type="submit"
            disabled={isPending}
            className="rounded-2xl bg-[#F7D2E0] p-1 mt-3 cursor-pointer hover:bg-[#F3B3CB] transition-all duration-300 w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Enviando...' : 'Enviar Código'}
          </button>
        </form>
      </div>
    </main>
  );
}
