import z from 'zod';

/**
 * Esquemas de validación para autenticación
 * Usamos Zod para validación en cliente y servidor
 */

export const LoginSchema = z.object({
  identifier: z.email('Ingrese un correo electrónico válido'),
  password: z
    .string('Campo requerido')
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(128, 'La contraseña es demasiado larga'),
});

export const RegisterSchema = z
  .object({
    username: z
      .string('Campo requerido')
      .min(8, 'El nombre debe tener al menos 8 caracteres')
      .max(128, 'El nombre es demasiado largo'),
    email: z.email('Ingrese un correo electrónico válido'),
    password: z
      .string('Campo requerido')
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .max(128, 'La contraseña es demasiado larga'),
    passwordConfirm: z.string('Campo requerido'),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'Las contraseñas no coinciden',
    path: ['passwordConfirm'],
  });

export const ResetPasswordSchema = z.object({
  email: z.email('Ingrese un correo electrónico válido'),
});

export const VerifyCodeSchema = z.object({
  code: z.string('Campo requerido').length(4, 'El código debe tener 4 dígitos'),
});
