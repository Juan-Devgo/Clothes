import { FormState } from '@/types/shared/forms';
import { CreateProductData, UpdateProductData } from './types';

/**
 * Errores de validación específicos para formularios de producto
 */
export interface ProductValidationErrors {
  name?: string[];
  price?: string[];
  currency?: string[];
  description?: string[];
  stock?: string[];
  category?: string[];
  subcategory?: string[];
  photo?: string[];
  documentId?: string[];
}

/**
 * CreateProductFormState: Crea un nuevo producto
 * Flujo: Formulario → Validación → Crear producto
 */
export interface CreateProductFormState extends FormState<
  CreateProductData,
  ProductValidationErrors
> {
  productId?: string; // documentId del producto creado
}

/**
 * UpdateProductFormState: Actualiza un producto existente
 * Flujo: Formulario → Validación → Actualizar producto
 */
export interface UpdateProductFormState extends FormState<
  UpdateProductData & { documentId: string },
  ProductValidationErrors
> {}

/**
 * DeleteProductFormState: Elimina un producto
 * Flujo: Confirmación → Eliminar producto
 */
export interface DeleteProductFormState extends FormState<
  { documentId: string },
  ProductValidationErrors
> {}
