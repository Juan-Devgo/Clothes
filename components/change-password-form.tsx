'use client';

import { useChangePasswordForm } from '@/hooks/useChangePasswordForm';
import FormError from './ui/form-error';

export default function ChangePasswordForm({
  email,
  code,
}: {
  email: string;
  code: string;
}) {
  const { formState, isPending, handleSubmit } = useChangePasswordForm();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(new FormData(e.currentTarget));
      }}
      className="flex flex-col gap-2 my-4 px-6"
    >
      <label htmlFor="new-password">Nueva Contraseña</label>
      <input
        type="password"
        id="new-password"
        name="new-password"
        required
        disabled={isPending}
        defaultValue={formState?.data?.newPassword ?? ''}
        className="rounded border border-black disabled:opacity-50 disabled:cursor-not-allowed"
      />
      <FormError errors={formState?.validationErrors?.newPassword} />
      <label htmlFor="new-password-confirm">Confirmar Contraseña</label>
      <input
        type="password"
        id="new-password-confirm"
        name="new-password-confirm"
        required
        disabled={isPending}
        defaultValue={formState?.data?.newPasswordConfirm ?? ''}
        className="rounded border border-black disabled:opacity-50 disabled:cursor-not-allowed"
      />
      <FormError errors={formState?.validationErrors?.newPasswordConfirm} />
      <input type="hidden" id="email" name="email" value={email} />
      <input type="hidden" id="code" name="code" value={code} />
      <button
        type="submit"
        disabled={isPending}
        className="rounded-2xl bg-[#F7D2E0] p-1 mt-3 cursor-pointer hover:bg-[#F3B3CB] transition-all duration-300 w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? 'Cambiando Contraseña...' : 'Cambiar Contraseña'}
      </button>
    </form>
  );
}
