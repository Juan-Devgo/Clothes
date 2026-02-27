'use client';

import { useState, useMemo } from 'react';
import { Product, ProductCategory, ProductSubcategory } from '@/types';
import { useCreateProduct, useUpdateProduct } from '@/hooks/products';
import { cmsApi } from '@/lib/paths';
import FormError from '../ui/form-error';
import ImageUpload from '../ui/image-upload';
import TagIcon from '../icons/tag';
import DollarIcon from '../icons/dollar';
import BoxIcon from '../icons/box';
import DescriptionIcon from '../icons/description';
import CategoryIcon from '../icons/category';
import CheckedIcon from '../icons/checked';

interface EditProductFormProps {
  type: 'edit' | 'create';
  product: Product;
  categories?: ProductCategory[];
  subcategories?: ProductSubcategory[];
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function EditProductForm({
  type,
  product,
  categories = [],
  subcategories = [],
  onSuccess,
  onCancel,
}: EditProductFormProps) {
  // Hooks para crear y actualizar
  const {
    formState: createFormState,
    handleSubmit: handleCreate,
    isPending: isCreating,
  } = useCreateProduct({
    onSuccess,
  });

  const {
    formState: updateFormState,
    handleSubmit: handleUpdate,
    isPending: isUpdating,
  } = useUpdateProduct({
    onSuccess,
  });

  const isPending = isCreating || isUpdating;
  const isCreate = type === 'create';
  const formState = isCreate ? createFormState : updateFormState;

  // Colores dinámicos según el tipo
  const iconBg = isCreate ? 'bg-green-100' : 'bg-blue-100';
  const iconColor = isCreate ? 'text-green-600' : 'text-blue-600';
  const focusRing = isCreate ? 'focus:ring-green-500' : 'focus:ring-blue-500';
  const buttonBg = isCreate ? 'bg-green-600' : 'bg-blue-600';
  const buttonHover = isCreate ? 'hover:bg-green-700' : 'hover:bg-blue-700';
  const buttonText = isCreate ? 'Crear Producto' : 'Guardar Cambios';

  // URL de la foto existente del producto (si existe)
  const existingPhotoUrl = product.photo?.url
    ? `${cmsApi.BASE_URL}${product.photo.url}`
    : null;

  // Estado para la categoría seleccionada (para filtrar subcategorías)
  const initialCategoryId =
    typeof product.category === 'object'
      ? product.category?.documentId
      : product.category || '';
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    initialCategoryId || '',
  );

  // Subcategorías filtradas por la categoría seleccionada
  const filteredSubcategories = useMemo(() => {
    if (!selectedCategoryId) return [];
    return subcategories.filter(
      (sub) => sub.product_category?.documentId === selectedCategoryId,
    );
  }, [subcategories, selectedCategoryId]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        if (isCreate) {
          handleCreate(formData);
        } else {
          handleUpdate(formData);
        }
      }}
      className="w-full"
    >
      {/* Campo oculto para documentId en modo edición */}
      {!isCreate && product.documentId && (
        <input
          type="hidden"
          name="documentId"
          defaultValue={product.documentId}
        />
      )}

      {/* Ícono de producto */}
      <div className="flex justify-center mb-6">
        <div
          className={`w-16 h-16 rounded-full ${iconBg} flex items-center justify-center`}
        >
          <span className={iconColor}>
            <BoxIcon />
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Nombre */}
        <div className="flex flex-col">
          <label
            htmlFor="name"
            className="text-sm font-medium text-gray-600 mb-1.5"
          >
            Nombre del producto <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <TagIcon />
            </span>
            <input
              type="text"
              id="name"
              name="name"
              defaultValue={product.name}
              disabled={isPending}
              className={`w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 ${focusRing} focus:border-transparent focus:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
              placeholder="Ej: Camiseta básica"
              required
            />
          </div>
          <FormError errors={formState?.validationErrors?.name} />
        </div>

        {/* Stock */}
        <div className="flex flex-col">
          <label
            htmlFor="stock"
            className="text-sm font-medium text-gray-600 mb-1.5"
          >
            Stock disponible <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <BoxIcon />
            </span>
            <input
              type="number"
              id="stock"
              name="stock"
              defaultValue={product.stock ?? 0}
              disabled={isPending}
              min="0"
              step="1"
              className={`w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 ${focusRing} focus:border-transparent focus:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
              placeholder="Ej: 10"
            />
          </div>
          <FormError errors={formState?.validationErrors?.stock} />
        </div>

        {/* Precio */}
        <div className="flex flex-col">
          <label
            htmlFor="price"
            className="text-sm font-medium text-gray-600 mb-1.5"
          >
            Precio <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <DollarIcon />
            </span>
            <input
              type="number"
              id="price"
              name="price"
              defaultValue={product.price}
              disabled={isPending}
              min="0"
              step="1000"
              className={`w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 ${focusRing} focus:border-transparent focus:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
              placeholder="Ej: 50000"
              required
            />
          </div>
          <FormError errors={formState?.validationErrors?.price} />
        </div>

        {/* Moneda */}
        <div className="flex flex-col">
          <label
            htmlFor="currency"
            className="text-sm font-medium text-gray-600 mb-1.5"
          >
            Moneda <span className="text-red-500">*</span>
          </label>
          <select
            id="currency"
            name="currency"
            defaultValue={product.currency || 'COP'}
            disabled={isPending}
            className={`px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 ${focusRing} focus:border-transparent focus:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <option value="COP">COP - Peso Colombiano</option>
            <option value="USD">USD - Dólar Estadounidense</option>
            <option value="EUR">EUR - Euro</option>
          </select>
          <FormError errors={formState?.validationErrors?.currency} />
        </div>

        {/* Categoría (campo de texto para documentId) */}
        <div className="flex flex-col">
          <label
            htmlFor="category"
            className="text-sm font-medium text-gray-600 mb-1.5"
          >
            Categoría <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <CategoryIcon />
            </span>
            <select
              id="category"
              name="category"
              defaultValue={
                typeof product.category === 'object'
                  ? product.category?.documentId
                  : product.category || ''
              }
              disabled={isPending}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className={`w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 ${focusRing} focus:border-transparent focus:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <option value="">Selecciona una categoría</option>
              {categories.map((category) => (
                <option key={category.documentId} value={category.documentId}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
          <FormError errors={formState?.validationErrors?.category} />
        </div>

        {/* Subcategoría (campo de texto para documentId) */}
        <div className="flex flex-col">
          <label
            htmlFor="subcategory"
            className="text-sm font-medium text-gray-600 mb-1.5"
          >
            Subcategoría <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <CategoryIcon />
            </span>
            <select
              id="subcategory"
              name="subcategory"
              defaultValue={
                typeof product.subcategory === 'object'
                  ? product.subcategory?.documentId
                  : product.subcategory || ''
              }
              disabled={isPending}
              className={`w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 ${focusRing} focus:border-transparent focus:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <option value="">Selecciona una subcategoría</option>
              {filteredSubcategories.length === 0 && selectedCategoryId ? (
                <option disabled>No hay subcategorías asociadas</option>
              ) : (
                filteredSubcategories.map((subcategory) => (
                  <option
                    key={subcategory.documentId}
                    value={subcategory.documentId}
                  >
                    {subcategory.label}
                  </option>
                ))
              )}
            </select>
          </div>
          <FormError errors={formState?.validationErrors?.subcategory} />
        </div>

        {/* Foto del producto */}
        <div className="flex flex-col md:col-span-2">
          <label
            htmlFor="photo"
            className="text-sm font-medium text-gray-600 mb-1.5"
          >
            Foto del producto
          </label>

          <ImageUpload
            name="photo"
            existingImageUrl={!isCreate ? existingPhotoUrl : null}
            existingImageAlt={product.photo?.alternativeText || product.name}
            disabled={isPending}
            serverErrors={formState?.validationErrors?.photo}
          />
        </div>

        {/* Descripción */}
        <div className="flex flex-col md:col-span-2">
          <label
            htmlFor="description"
            className="text-sm font-medium text-gray-600 mb-1.5"
          >
            Descripción
          </label>
          <div className="relative">
            <span className="absolute left-4 top-3 text-gray-400">
              <DescriptionIcon />
            </span>
            <textarea
              id="description"
              name="description"
              defaultValue={product.description || ''}
              disabled={isPending}
              rows={3}
              className={`w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 ${focusRing} focus:border-transparent focus:bg-white transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed`}
              placeholder="Descripción del producto, materiales, tallas disponibles, etc."
            />
          </div>
          <FormError errors={formState?.validationErrors?.description} />
        </div>

        {/* Botones */}
        <div className="flex gap-3 w-full md:col-span-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isPending}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={isPending}
            className={`flex-1 px-4 py-2.5 ${buttonBg} text-white rounded-lg ${buttonHover} transition-colors font-medium flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isPending ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <CheckedIcon />
            )}
            {isPending ? 'Procesando...' : buttonText}
          </button>
        </div>
      </div>
    </form>
  );
}
