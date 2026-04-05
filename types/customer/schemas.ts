import * as z from 'zod';

export const CreateCustomerSchema = z.object({
  first_name: z
    .string('Campo requerido')
    .min(3, 'El nombre es demasiado corto')
    .max(32, 'El nombre es demasiado largo')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s*]+$/, 'El nombre solo puede contener letras y espacios'),
  last_name: z
    .string('Campo requerido')
    .min(3, 'El apellido es demasiado corto')
    .max(32, 'El apellido es demasiado largo')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s*]+$/, 'El apellido solo puede contener letras y espacios'),
  email: z.email('Ingrese un correo electrónico válido').optional(),
  phone: z.string('Campo requerido').regex(/^\+[1-9]\d{1,14}$/, 'El teléfono solo puede contener números y debe incluir el código de país que inicia con +'),
  birthdate: z.string().optional(),
  tastes: z.string().optional(),
});

export const UpdateCustomerSchema = CreateCustomerSchema.partial();