'use client';

import FormError from '@/components/ui/form-error';
import { useLoginForm } from '@/hooks/auth/useLoginForm';
import Link from 'next/link';

export default function Login() {
  const { formState, handleSubmit, isPending } = useLoginForm();

  return (
    <main className="bg-white min-h-screen flex flex-col items-center justify-center text-gray-800">
      <div className="rounded-3xl border border-gray-200 shadow-2xl w-96">
        <div className="text-center my-4 mx-2">
          <h1 className="text-4xl">Iniciar Sesión</h1>
          <p className="text-sm text-gray-500">
            Formulario para ingresar al sistema
          </p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(new FormData(e.currentTarget));
          }}
          className="flex flex-col gap-2 my-4 px-6"
        >
          <label htmlFor="email">Correo Electrónico</label>
          <input
            type="email"
            id="email"
            name="email"
            required
            disabled={isPending}
            defaultValue={formState?.data?.identifier}
            className="rounded border border-black disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <FormError errors={formState?.validationErrors?.email} />
          <label htmlFor="password">Contraseña</label>
          <input
            type="password"
            id="password"
            name="password"
            required
            disabled={isPending}
            defaultValue={formState?.data?.password}
            className="rounded border border-black disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <FormError errors={formState?.validationErrors?.password} />
          <button
            type="submit"
            disabled={isPending}
            className="rounded-2xl bg-[#F7D2E0] p-1 mt-3 cursor-pointer hover:bg-[#F3B3CB] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            {isPending ? 'Cargando...' : 'Ingresar'}
          </button>
        </form>
        <div className="text-center my-4 mx-2">
          <p className="text-sm text-gray-500">
            ¿Olvidaste tu contraseña?{' '}
            <Link href="/reset-password">
              <strong>Reestablecer Contraseña</strong>
            </Link>
          </p>
          <p className="text-sm text-gray-500 mt-2">
            ¿No tienes una cuenta?{' '}
            <Link href="/register">
              <strong>Regístrate</strong>
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
