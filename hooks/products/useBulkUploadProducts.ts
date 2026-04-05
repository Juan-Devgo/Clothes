'use client';

import { useBulkUpload } from '@/hooks/bulk';
import {
  createProductsBulkAction,
  deleteAllProductsAction,
} from '@/actions/products';
import {
  createProductExcelRowSchema,
  ProductExcelRow,
} from '@/types/product/excel-schemas';
import { parseSpreadsheetFile, type ExcelParseConfig } from '@/service/excel';
import { BulkUploadEntityConfig } from '@/types/shared/bulk';
import type { ProductCategory, ProductSubcategory } from '@/types';

/**
 * Configuración de parseo Excel para Productos.
 * Mapea los nombres de columna de la plantilla a las claves del schema Zod.
 */
const productExcelConfig: ExcelParseConfig = {
  columnMapping: {
    Nombre: 'name',
    Precio: 'price',
    Moneda: 'currency',
    Descripción: 'description',
    Stock: 'stock',
    Categoría: 'category',
    Subcategoría: 'subcategory',
  },
  fieldTransformers: {
    price: (v) => (v !== undefined && v !== null ? Number(v) : undefined),
    stock: (v) => (v !== undefined && v !== null ? Number(v) : 0),
  },
};

const columnLabels = Object.fromEntries(
  Object.entries(productExcelConfig.columnMapping).map(([k, v]) => [v, k]),
);

export function useBulkUploadProducts(
  categories: ProductCategory[] = [],
  subcategories: ProductSubcategory[] = [],
) {
  const productBulkConfig: BulkUploadEntityConfig<ProductExcelRow> = {
    entityName: 'Producto',
    columnLabels,
    rowSchema: createProductExcelRowSchema(categories, subcategories),
    bulkCreateAction: createProductsBulkAction,
    deleteAllAction: deleteAllProductsAction,
    parseExcelFile: (file) => parseSpreadsheetFile(file, productExcelConfig),
  };

  return useBulkUpload<ProductExcelRow>(productBulkConfig);
}
