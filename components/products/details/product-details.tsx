'use client';

import { Product } from '@/types';
import { useState } from 'react';
import Image from 'next/image';
import ImageIcon from '@/components/icons/image';
import { cmsApi } from '@/lib/paths';
import {
  getProductStateColor,
  getProductCategoryColor,
  getProductSubcategoryColor,
} from '@/lib/enums-styles';
import { getCategoryIcon } from '@/components/icons/category-icons';

interface ProductDetailsProps {
  product: Product | null;
}

export default function ProductDetails({ product }: ProductDetailsProps) {
  const [imageError, setImageError] = useState(false);

  if (!product) {
    return (
      <p className="text-center text-gray-500">
        No se pudo cargar el producto.
      </p>
    );
  }

  return (
    <div className="w-full">
      {/* Header: Nombre y badges */}
      <div className="flex flex-wrap items-center justify-between mb-6 pb-4 border-b border-gray-200 gap-3">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-12 h-12 rounded-full bg-[#fdecf2] flex items-center justify-center">
            <span className="text-[#f37ca8]">
              {getCategoryIcon(product.category?.name)}
            </span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {product.name}
            </h3>
            <p className="text-sm text-gray-500">
              {product.currency} $
              {new Intl.NumberFormat('es-CO').format(product.price)} · Stock:{' '}
              {product.stock}
            </p>
          </div>
        </div>
        <span
          className={`px-3 py-1.5 rounded-full text-sm font-medium ${getProductStateColor(product.state?.name)}`}
        >
          {product.state?.label || 'Sin estado'}
        </span>
      </div>

      {/* Categoría y subcategoría */}
      <div className="flex items-center gap-3 mb-6">
        <span
          className={`px-3 py-1.5 rounded-full text-sm font-medium ${getProductCategoryColor(product.category?.name)}`}
        >
          {product.category?.label || 'Sin categoría'}
        </span>
        <span
          className={`px-3 py-1.5 rounded-full text-sm font-medium ${getProductSubcategoryColor(product.subcategory?.name)}`}
        >
          {product.subcategory?.label || 'Sin subcategoría'}
        </span>
      </div>

      {/* Foto del producto */}
      <div className="relative mb-6 w-full h-48 sm:h-64 md:h-80 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
        {product.photo?.url && !imageError ? (
          <Image
            src={`${cmsApi.BASE_URL}${product.photo.url}`}
            alt={product.photo.alternativeText || product.name}
            fill
            unoptimized
            className="object-contain"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-400">
            <ImageIcon className="w-16 h-16" />
            <span className="text-sm">Sin imagen disponible</span>
          </div>
        )}
      </div>

      {/* Descripción */}
      <div className="pt-4 border-t border-gray-200">
        <div className="bg-[#fdecf2] rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-800 mb-1">
            Descripción:
          </h4>
          <p className="text-gray-700">
            {product.description ||
              'No se ha registrado una descripción para este producto.'}
          </p>
        </div>
      </div>
    </div>
  );
}
