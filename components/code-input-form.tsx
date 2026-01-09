'use client';

import { useRef, useState, useEffect } from 'react';
import { useVerifyUserForm } from '@/hooks/useVerifyUserForm';
import { useVerifyResetPasswordForm } from '@/hooks/useVerifyResetPasswordForm';
import { usePathname } from 'next/navigation';

type FormType = 'verify-user' | 'reset-password';

interface CodeInputFormProps {
  type: FormType;
  email?: string;
  username?: string;
  password?: string;
}

const formConfig: Record<
  FormType,
  {
    buttonText: string;
    hiddenTypeValue: string;
  }
> = {
  'verify-user': {
    buttonText: 'Verificar Cuenta',
    hiddenTypeValue: 'auth-register',
  },
  'reset-password': {
    buttonText: 'Restablecer Contraseña',
    hiddenTypeValue: 'reset-password',
  },
};

export default function CodeInputForm({
  type,
  email = '',
  username = '',
  password = '',
}: CodeInputFormProps) {
  const [code, setCode] = useState(['', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Reiniciar el código cuando el componente se monta o cambia el tipo
  useEffect(() => {
    setCode(['', '', '', '']);
  }, [type]);

  // Seleccionar el hook según el tipo
  const verifyUserForm = useVerifyUserForm();
  const resetPasswordForm = useVerifyResetPasswordForm();

  const { handleSubmit, isPending } =
    type === 'verify-user' ? verifyUserForm : resetPasswordForm;

  const config = formConfig[type];

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');
    if (pastedData.length === 4) {
      const newCode = pastedData.split('').slice(0, 4);
      setCode(newCode);
      inputRefs.current[3]?.focus();
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(new FormData(e.currentTarget));
      }}
      className="flex flex-col gap-4 my-4 px-6"
    >
      {/* Hidden fields para verify-user */}
      {type === 'verify-user' && (
        <>
          <input type="hidden" id="email" name="email" value={email} />
          <input type="hidden" id="username" name="username" value={username} />
          <input type="hidden" id="password" name="password" value={password} />
        </>
      )}
      {/* Hidden fields para reset-password */}
      {type === 'reset-password' && (
        <input type="hidden" id="email" name="email" value={email} />
      )}
      <input type="hidden" name="type" value={config.hiddenTypeValue} />

      <div className="flex justify-center gap-3">
        {[0, 1, 2, 3].map((index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            name={`code-${index}`}
            value={code[index]}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            className="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-[#F3B3CB] focus:outline-none transition-colors duration-200"
            placeholder="-"
          />
        ))}
      </div>
      <button
        type="submit"
        disabled={code.some((digit) => !digit) || isPending}
        className="rounded-2xl bg-[#F7D2E0] p-2 mt-3 cursor-pointer hover:bg-[#F3B3CB] transition-all duration-300 w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? 'Procesando...' : config.buttonText}
      </button>
    </form>
  );
}
