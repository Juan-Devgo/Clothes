import z from 'zod';

/**
 * Esquema Zod para validar cada fila de un archivo Excel de productos.
 * Los campos coinciden con los requeridos por CreateProductSchema,
 * pero adaptados para datos provenientes de Excel.
 */
export const ProductExcelRowSchema = z.object({
  name: z
    .string('Campo requerido')
    .min(2, 'El nombre es demasiado corto')
    .max(100, 'El nombre es demasiado largo'),
  price: z
    .number('Debe ser un número')
    .positive('El precio debe ser mayor a 0'),
  currency: z.string().default('COP'),
  description: z
    .string()
    .max(500, 'La descripción es demasiado larga')
    .optional(),
  stock: z
    .number('Debe ser un número')
    .int('El stock debe ser un número entero')
    .nonnegative('El stock no puede ser negativo')
    .default(0),
  category: z.string().optional(),
  subcategory: z.string().optional(),
});

export type ProductExcelRow = z.infer<typeof ProductExcelRowSchema>;
