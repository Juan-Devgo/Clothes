'use client';

import { useRef, useState } from 'react';

export default function EnterCode() {
  const [code, setCode] = useState(['', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    // Solo permitir dígitos
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1); // Solo el último dígito
    setCode(newCode);

    // Auto-avance al siguiente input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    // Retroceso: ir al input anterior
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    // Permitir navegación con flechas
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fullCode = code.join('');

    // Aquí iría la lógica para verificar el código
    
    console.log('Código ingresado:', fullCode);
  };

  return (
    <main className="bg-white min-h-screen flex flex-col items-center justify-center text-gray-800">
      <div className="rounded-3xl border border-gray-200 shadow-2xl w-96">
        <div className="text-center my-4 mx-2">
          <h1 className="text-4xl">Ingresa el Código que Recibiste</h1>
          <p className="text-md text-gray-800 mt-1">
            Ingresa el código que recibiste en tu correo para{' '}
            <strong>reestablecer tu contraseña.</strong>
          </p>
        </div>
        <form className="flex flex-col gap-4 my-4 px-6" onSubmit={handleSubmit}>
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
            disabled={code.some((digit) => !digit)}
            className="rounded-2xl bg-[#F7D2E0] p-2 mt-3 cursor-pointer hover:bg-[#F3B3CB] transition-all duration-300 w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reestablecer Contraseña
          </button>
        </form>
      </div>
    </main>
  );
}
