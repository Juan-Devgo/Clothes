'use client';

import { useState, useRef } from 'react';
import { Product, ProductCategory, ProductSubcategory } from '@/types';
import { useCreateProduct, useUpdateProduct } from '@/hooks/products';
import { cmsApi } from '@/lib/paths';
import FormError from '../ui/form-error';
import TagIcon from '../icons/tag';
import DollarIcon from '../icons/dollar';
import BoxIcon from '../icons/box';
import DescriptionIcon from '../icons/description';
import CategoryIcon from '../icons/category';
import CheckedIcon from '../icons/checked';
import ImageIcon from '../icons/image';
import { CameraIcon } from '../icons/camera';

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

  // Estado para la vista previa de la imagen
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // URL de la foto existente del producto (si existe)
  const existingPhotoUrl = product.photo?.url
    ? `${cmsApi.BASE_URL}${product.photo.url}`
    : null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setImagePreview(null);
        return;
      }
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    } else {
      setImagePreview(null);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleTakePhoto = () => {
    // Crear un input temporal con capture para forzar apertura de cámara
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.setAttribute('capture', 'environment');
    input.onchange = () => {
      const file = input.files?.[0];
      if (file) {
        const url = URL.createObjectURL(file);
        setImagePreview(url);
        // Copiar al input principal para enviar en el FormData
        if (fileInputRef.current) {
          const dt = new DataTransfer();
          dt.items.add(file);
          fileInputRef.current.files = dt.files;
        }
      }
    };
    input.click();
  };

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
              {subcategories.map((subcategory) => (
                <option
                  key={subcategory.documentId}
                  value={subcategory.documentId}
                >
                  {subcategory.label}
                </option>
              ))}
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

          <div className="flex flex-col gap-3">
            {/* Vista previa */}
            <div className="w-full h-36 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Vista previa"
                  className="w-full h-full object-contain rounded-lg"
                />
              ) : existingPhotoUrl && !isCreate ? (
                <img
                  src={existingPhotoUrl}
                  alt={product.photo?.alternativeText || product.name}
                  className="w-full h-full object-contain rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement)
                      .parentElement!.querySelector('.fallback-icon')
                      ?.classList.remove('hidden');
                  }}
                />
              ) : (
                <span className="text-gray-400">
                  <ImageIcon className="w-10 h-10" />
                </span>
              )}
              {/* Ícono fallback oculto */}
              {existingPhotoUrl && !isCreate && !imagePreview && (
                <span className="fallback-icon hidden text-gray-400">
                  <ImageIcon className="w-10 h-10" />
                </span>
              )}
            </div>

            {/* Controles de carga */}
            <input
              ref={fileInputRef}
              type="file"
              id="photo"
              name="photo"
              accept="image/*"
              disabled={isPending}
              onChange={handleImageChange}
              className="hidden"
            />

            <div className="flex gap-2 flex-wrap items-center">
              {/* Botón subir archivo */}
              <button
                type="button"
                disabled={isPending}
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 min-w-0 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ImageIcon className="w-4 h-4" />
                Subir imagen
              </button>

              {/* Botón tomar foto (dispara cámara en móvil) */}
              <button
                type="button"
                disabled={isPending}
                onClick={handleTakePhoto}
                className="flex-1 min-w-0 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CameraIcon />
                Tomar foto
              </button>

              {/* Botón quitar imagen seleccionada */}
              {imagePreview && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  disabled={isPending}
                  className="flex-1 min-w-0 px-3 py-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg cursor-pointer hover:bg-red-100 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ✕ Quitar
                </button>
              )}

              <p className="text-xs text-gray-400 w-full text-center">
                JPG, PNG o WebP. Máximo 5MB.
              </p>
            </div>
          </div>
          <FormError errors={formState?.validationErrors?.photo} />
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
