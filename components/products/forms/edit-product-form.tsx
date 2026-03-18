'use client';

import { useState, useMemo } from 'react';
import { Product, ProductCategory, ProductSubcategory } from '@/types';
import { useCreateProduct, useUpdateProduct } from '@/hooks/products';
import { cmsApi } from '@/lib/paths';
import FormError from '@/components/ui/form-error';
import ImageUpload from '@/components/ui/image-upload';
import CustomSelect from '@/components/ui/custom-select';
import TagIcon from '@/components/icons/tag';
import DollarIcon from '@/components/icons/dollar';
import BoxIcon from '@/components/icons/box';
import DescriptionIcon from '@/components/icons/description';
import CategoryIcon from '@/components/icons/category';
import CheckedIcon from '@/components/icons/checked';

interface EditProductFormProps {
  type: 'edit' | 'create';
  product: Product;
  categories?: ProductCategory[];
  subcategories?: ProductSubcategory[];
  onSuccess?: () => void;
  onCancel?: () => void;
  /** Si se especifica, solo estos campos estarán habilitados (para edición masiva) */
  enabledFields?: string[];
  /** Submit personalizado para edición masiva (reemplaza el submit normal) */
  onBulkSubmit?: (formData: FormData) => void;
  /** Número de registros que se actualizarán (para el texto del botón) */
  bulkRecordCount?: number;
  /** Estado de carga externo (ej: hook de edición masiva) */
  isPendingExternal?: boolean;
}

export default function EditProductForm({
  type,
  product,
  categories = [],
  subcategories = [],
  onSuccess,
  onCancel,
  enabledFields,
  onBulkSubmit,
  bulkRecordCount,
  isPendingExternal = false,
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

  const isPending = isCreating || isUpdating || isPendingExternal;
  const isCreate = type === 'create';
  const formState = isCreate ? createFormState : updateFormState;

  // Un campo está habilitado si enabledFields no está definido O si está en la lista
  const isFieldEnabled = (fieldName: string) =>
    enabledFields === undefined || enabledFields.includes(fieldName);

  // Colores dinámicos según el tipo
  const iconBg = isCreate ? 'bg-green-100' : 'bg-blue-100';
  const iconColor = isCreate ? 'text-green-600' : 'text-blue-600';
  const focusRing = isCreate ? 'focus:ring-green-500' : 'focus:ring-blue-500';
  const buttonBg = isCreate ? 'bg-green-600' : 'bg-blue-600';
  const buttonHover = isCreate ? 'hover:bg-green-700' : 'hover:bg-blue-700';
  const buttonText = bulkRecordCount
    ? `Guardar en ${bulkRecordCount} registros`
    : isCreate
      ? 'Crear Producto'
      : 'Guardar Cambios';

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
  const initialSubcategoryId =
    typeof product.subcategory === 'object'
      ? product.subcategory?.documentId
      : product.subcategory || '';
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string>(
    initialSubcategoryId || '',
  );

  // Subcategorías filtradas por la categoría seleccionada
  const filteredSubcategories = useMemo(() => {
    if (!selectedCategoryId) return [];
    return subcategories.filter(
      (sub) => sub.product_category?.documentId === selectedCategoryId,
    );
  }, [subcategories, selectedCategoryId]);

  const currencyOptions = useMemo(
    () => [
      { value: 'COP', label: 'COP - Peso Colombiano' },
      { value: 'USD', label: 'USD - Dólar Estadounidense' },
      { value: 'EUR', label: 'EUR - Euro' },
    ],
    [],
  );

  const categoryOptions = useMemo(
    () =>
      categories
        .filter((category) => Boolean(category.documentId))
        .map((category) => ({
          value: category.documentId as string,
          label: category.label,
        })),
    [categories],
  );

  const subcategoryOptions = useMemo(
    () =>
      filteredSubcategories
        .filter((subcategory) => Boolean(subcategory.documentId))
        .map((subcategory) => ({
          value: subcategory.documentId as string,
          label: subcategory.label,
        })),
    [filteredSubcategories],
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        if (onBulkSubmit) {
          onBulkSubmit(formData);
        } else if (isCreate) {
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
              disabled={isPending || !isFieldEnabled('name')}
              className={`w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 ${focusRing} focus:border-transparent focus:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
              placeholder="Ej: Camiseta básica"
              required={isFieldEnabled('name')}
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
              disabled={isPending || !isFieldEnabled('stock')}
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
              disabled={isPending || !isFieldEnabled('price')}
              min="0"
              step="1000"
              className={`w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 ${focusRing} focus:border-transparent focus:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
              placeholder="Ej: 50000"
              required={isFieldEnabled('price')}
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
          <CustomSelect
            id="currency"
            name="currency"
            options={currencyOptions}
            defaultValue={product.currency || 'COP'}
            disabled={isPending || !isFieldEnabled('currency')}
            required={isFieldEnabled('currency')}
            triggerClass={focusRing}
          />
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
          <CustomSelect
            id="category"
            name="category"
            options={categoryOptions}
            value={selectedCategoryId}
            onChange={(newValue) => {
              setSelectedCategoryId(newValue);
              setSelectedSubcategoryId('');
            }}
            placeholder="Selecciona una categoría"
            disabled={isPending || !isFieldEnabled('category')}
            required={isFieldEnabled('category')}
            icon={<CategoryIcon />}
            triggerClass={`w-full ${focusRing}`}
          />
          <FormError errors={formState?.validationErrors?.category} />
        </div>

        {/* Subcategoría (campo de texto para documentId) */}
        <div className="flex flex-col">
          <label
            htmlFor="subcategory"
            className="text-sm font-medium text-gray-600 mb-1.5"
          >
            Subcategoría
          </label>
          <CustomSelect
            id="subcategory"
            name="subcategory"
            options={subcategoryOptions}
            value={selectedSubcategoryId}
            onChange={(newValue) => setSelectedSubcategoryId(newValue)}
            placeholder={
              selectedCategoryId && subcategoryOptions.length === 0
                ? 'No hay subcategorías asociadas'
                : 'Selecciona una subcategoría'
            }
            disabled={
              isPending ||
              !isFieldEnabled('subcategory') ||
              !selectedCategoryId ||
              subcategoryOptions.length === 0
            }
            icon={<CategoryIcon />}
            triggerClass={`w-full ${focusRing}`}
          />
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
            disabled={isPending || !isFieldEnabled('photo')}
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
              disabled={isPending || !isFieldEnabled('description')}
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
