'use client';

import { useBulkDownload } from '@/hooks/bulk';
import { BulkDownloadEntityConfig } from '@/types/shared/bulk';
import { Product } from '@/types';

const productDownloadConfig: BulkDownloadEntityConfig<Product> = {
  entityName: 'productos',
  templateUrl: '/excel_templates/productos.xlsx',
  columnMapping: {
    Nombre: 'name',
    Precio: 'price',
    Moneda: 'currency',
    Descripción: 'description',
    Stock: 'stock',
    Categoría: 'category',
    Subcategoría: 'subcategory',
  },
  rowMapper: (product) => ({
    name: product.name,
    price: product.price,
    currency: product.currency,
    description: product.description ?? null,
    stock: product.stock,
    category: product.category?.label ?? null,
    subcategory: product.subcategory?.label ?? null,
  }),
};

export function useBulkDownloadProducts() {
  return useBulkDownload<Product>(productDownloadConfig);
}
