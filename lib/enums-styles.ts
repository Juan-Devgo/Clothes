/**
 * Funciones de estilos según enumeraciones
 *
 * Centraliza los colores de badges para estados, categorías
 * y subcategorías reutilizados en múltiples componentes.
 */

// ─── Estados de Cuenta ───────────────────────────────────────────────

export function getAccountStateColor(stateName?: string): string {
  switch (stateName?.toUpperCase()) {
    case 'FREE':
      return 'bg-green-100 text-green-800';
    case 'SEPARATE':
      return 'bg-yellow-100 text-yellow-800';
    case 'CREDIT':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

// ─── Estados de Producto ─────────────────────────────────────────────

export function getProductStateColor(stateName?: string): string {
  switch (stateName?.toUpperCase()) {
    case 'NO_STOCK':
      return 'bg-red-100 text-red-800';
    case 'RETIRED':
      return 'bg-yellow-100 text-yellow-800';
    case 'STOCK':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

// ─── Categorías de Producto ──────────────────────────────────────────

export function getProductCategoryColor(categoryName?: string): string {
  switch (categoryName?.toUpperCase()) {
    case 'BAGS':
      return 'bg-rose-100 text-rose-800';
    case 'BELTS':
      return 'bg-emerald-100 text-emerald-800';
    case 'CLOTHES':
      return 'bg-indigo-100 text-indigo-800';
    case 'JEWELRY':
      return 'bg-yellow-100 text-yellow-800';
    case 'OMNILIFE':
      return 'bg-purple-100 text-purple-800';
    case 'PERFUME':
      return 'bg-fuchsia-100 text-fuchsia-800';
    case 'SHOES':
      return 'bg-red-100 text-red-800';
    case 'WATCHES':
      return 'bg-amber-100 text-amber-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

// ─── Subcategorías de Producto ───────────────────────────────────────

export function getProductSubcategoryColor(subcategoryName?: string): string {
  switch (subcategoryName?.toUpperCase()) {
    case 'FREE':
      return 'bg-green-100 text-green-800';
    case 'SEPARATE':
      return 'bg-yellow-100 text-yellow-800';
    case 'CREDIT':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
