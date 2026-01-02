'use client';

import { useRef, useState } from 'react';
import { useVerifyUserForm } from '@/hooks/useVerifyUserForm';

interface VerifyUserFormProps {
  email: string;
  username: string;
  password: string;
}

export default function VerifyUserForm({
  email,
  username,
  password,
}: VerifyUserFormProps) {
  const [code, setCode] = useState(['', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { formState, handleSubmit, isPending } = useVerifyUserForm();

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

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(new FormData(e.currentTarget));
      }}
      className="flex flex-col gap-4 my-4 px-6"
    >
      <input type="hidden" name="email" value={email} />
      <input type="hidden" name="username" value={username} />
      <input type="hidden" name="password" value={password} />
      <input type="hidden" name="type" value="auth-register" />

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
        Verificar Cuenta
      </button>
    </form>
  );
}
