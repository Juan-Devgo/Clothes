import * as z from 'zod';
import type { ProductCategory, ProductSubcategory } from '@/types';

/**
 * Crea el esquema Zod para validar filas de Excel de productos.
 * Las columnas de categoría y subcategoría aceptan el label visible
 * (ej: "Ropa de Mujer") y lo transforman al documentId correspondiente.
 */
export function createProductExcelRowSchema(
  categories: ProductCategory[] = [],
  subcategories: ProductSubcategory[] = [],
) {
  return z.object({
    name: z
      .string()
      .min(2, 'El nombre es demasiado corto')
      .max(100, 'El nombre es demasiado largo'),
    price: z
      .number()
      .positive('El precio debe ser mayor a 0'),
    currency: z.string().default('COP'),
    description: z
      .string()
      .max(500, 'La descripción es demasiado larga')
      .optional(),
    stock: z
      .number()
      .int('El stock debe ser un número entero')
      .nonnegative('El stock no puede ser negativo')
      .default(0),
    category: z
      .string()
      .optional()
      .transform((val, ctx) => {
        if (!val) return undefined;
        const match = categories.find(
          (c) => c.label.toLowerCase() === val.toLowerCase(),
        );
        if (!match?.documentId) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Categoría no reconocida: "${val}"`,
          });
          return z.NEVER;
        }
        return match.documentId;
      }),
    subcategory: z
      .string()
      .optional()
      .transform((val, ctx) => {
        if (!val) return undefined;
        const match = subcategories.find(
          (s) => s.label.toLowerCase() === val.toLowerCase(),
        );
        if (!match?.documentId) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Subcategoría no reconocida: "${val}"`,
          });
          return z.NEVER;
        }
        return match.documentId;
      }),
  });
}

export type ProductExcelRow = {
  name: string;
  price: number;
  currency: string;
  description?: string;
  stock: number;
  category?: string;
  subcategory?: string;
};
