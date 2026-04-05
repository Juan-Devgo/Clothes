import * as z from "zod";

/**
 * Esquema Zod para validar cada fila de un archivo Excel de clientes.
 * Los campos coinciden con los requeridos por CreateCustomerSchema,
 * pero adaptados para datos provenientes de Excel (todos string).
 */
export const CustomerExcelRowSchema = z.object({
  first_name: z
    .string()
    .min(3, "El nombre es demasiado corto")
    .max(32, "El nombre es demasiado largo")
    .regex(
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s*]+$/,
      "El nombre solo puede contener letras y espacios",
    ),
  last_name: z
    .string()
    .min(3, "El apellido es demasiado corto")
    .max(32, "El apellido es demasiado largo")
    .regex(
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s*]+$/,
      "El apellido solo puede contener letras y espacios",
    ),
  email: z.email("Correo electrónico inválido").optional(),
  phone: z
    .string()
    .regex(
      /^\+[1-9]\d{1,14}$/,
      "El teléfono solo puede contener números y debe incluir el código de país que inicia con +",
    ),
  birthdate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "El formato de la fecha debe ser YYYY-MM-DD")
    .optional(),
  tastes: z.string().optional(),
});

export type CustomerExcelRow = z.infer<typeof CustomerExcelRowSchema>;
