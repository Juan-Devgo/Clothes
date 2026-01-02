'use client';

import FormError from '@/components/ui/form-error';
import { useRegisterForm } from '@/hooks/useRegisterForm';
import Link from 'next/link';

export default function Register() {
  const { formState, handleSubmit, isPending } = useRegisterForm();

  return (
    <main className="bg-white min-h-screen flex flex-col items-center justify-center text-gray-800">
      <div className="rounded-3xl border border-gray-200 shadow-2xl w-96">
        <div className="text-center my-4 mx-2">
          <h1 className="text-4xl">Crear Cuenta</h1>
          <p className="text-sm text-gray-500">
            Formulario para crear una cuenta nueva
          </p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(new FormData(e.currentTarget));
          }}
          className="flex flex-col gap-2 my-4 px-6"
        >
          <label htmlFor="username">Nombre Completo</label>
          <input
            type="text"
            id="username"
            name="username"
            required
            disabled={isPending}
            defaultValue={formState?.data?.username ?? ''}
            className="rounded border border-black disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <FormError errors={formState?.validationErrors?.username} />
          <label htmlFor="email">Correo Electrónico</label>
          <input
            type="email"
            id="email"
            name="email"
            required
            disabled={isPending}
            defaultValue={formState?.data?.email ?? ''}
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
            defaultValue={formState?.data?.password ?? ''}
            className="rounded border border-black disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <FormError errors={formState?.validationErrors?.password} />
          <label htmlFor="password">Confirmar Contraseña</label>
          <input
            type="password"
            id="password-confirm"
            name="password-confirm"
            required
            disabled={isPending}
            defaultValue={formState?.data?.passwordConfirm ?? ''}
            className="rounded border border-black disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <FormError errors={formState?.validationErrors?.passwordConfirm} />
          <button
            type="submit"
            disabled={isPending}
            className="rounded-2xl bg-[#F7D2E0] p-2 mt-3 hover:bg-[#F3B3CB] cursor-pointer transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            {isPending ? 'Creando cuenta...' : 'Crear Cuenta'}
          </button>
        </form>
        <div className="text-center my-4 mx-2">
          <p className="text-sm text-gray-500">
            ¿Ya tienes una cuenta?{' '}
            <Link href="/login">
              <strong>Inicia Sesión</strong>
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
