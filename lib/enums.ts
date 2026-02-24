import { cmsApi } from './paths';
import { getContent } from '@/service/cms';

interface EnumItem {
  documentId: string;
  name: string;
}

// ─── Estados de Cuenta ───────────────────────────────────────────────

/**
 * Obtener el documentId de un estado de cuenta por su nombre
 */
async function getAccountStateId(stateName: string): Promise<string | null> {
  try {
    const result = await getContent<EnumItem[]>(
      `${cmsApi.ACCOUNT_STATES}?filters[name][$eq]=${stateName}`,
    );
    if (!result.success) return null;
    return result.data?.[0]?.documentId ?? null;
  } catch {
    return null;
  }
}

export const ACCOUNT_STATES = {
  FREE: () => getAccountStateId('FREE'),
  SEPARATE: () => getAccountStateId('SEPARATE'),
  CREDIT: () => getAccountStateId('CREDIT'),
  COMBINED: () => getAccountStateId('COMBINED'),
} as const;

// ─── Estados de Producto ─────────────────────────────────────────────

/**
 * Obtener el documentId de un estado de producto por su nombre
 */
async function getProductStateId(stateName: string): Promise<string | null> {
  try {
    const result = await getContent<EnumItem[]>(
      `${cmsApi.PRODUCT_STATES}?filters[name][$eq]=${stateName}`,
    );
    if (!result.success) return null;
    return result.data?.[0]?.documentId ?? null;
  } catch {
    return null;
  }
}

export const PRODUCT_STATES = {
  STOCK: () => getProductStateId('STOCK'),
  NO_STOCK: () => getProductStateId('NO_STOCK'),
  RETIRED: () => getProductStateId('RETIRED'),
} as const;

// ─── Categorías de Producto ──────────────────────────────────────────

/**
 * Obtener el documentId de una categoría de producto por su nombre
 */
async function getProductCategoryId(
  categoryName: string,
): Promise<string | null> {
  try {
    const result = await getContent<EnumItem[]>(
      `${cmsApi.PRODUCT_CATEGORIES}?filters[name][$eq]=${categoryName}`,
    );
    if (!result.success) return null;
    return result.data?.[0]?.documentId ?? null;
  } catch {
    return null;
  }
}

export const PRODUCT_CATEGORIES = {
  BAGS: () => getProductCategoryId('BAGS'),
  BELTS: () => getProductCategoryId('BELTS'),
  CLOTHES: () => getProductCategoryId('CLOTHES'),
  JEWELRY: () => getProductCategoryId('JEWELRY'),
  OMNILIFE: () => getProductCategoryId('OMNILIFE'),
  PERFUME: () => getProductCategoryId('PERFUME'),
  SHOES: () => getProductCategoryId('SHOES'),
  WATCHES: () => getProductCategoryId('WATCHES'),
} as const;

// ─── Subcategorías de Producto ───────────────────────────────────────

/**
 * Obtener el documentId de una subcategoría de producto
 * filtrando por su nombre y la categoría a la que pertenece
 */
async function getProductSubcategoryId(
  subcategoryName: string,
  categoryName: string,
): Promise<string | null> {
  try {
    const result = await getContent<EnumItem[]>(
      `${cmsApi.PRODUCT_SUBCATEGORIES}?filters[name][$eq]=${subcategoryName}&filters[product_category][name][$eq]=${categoryName}`,
    );
    if (!result.success) return null;
    return result.data?.[0]?.documentId ?? null;
  } catch {
    return null;
  }
}

/**
 * Obtener las subcategorías de un producto proporcionando el nombre de la categoría
 */
export function getProductSubcategoryIdByCategory(categoryName: string) {
  return {
    get: (subcategoryName: string) =>
      getProductSubcategoryId(subcategoryName, categoryName),
  };
}
