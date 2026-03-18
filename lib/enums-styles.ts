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
// Paletas distintas a los estados (rojo/amarillo/verde):
//   BAGS → rose | BELTS → teal | CLOTHES → indigo | JEWELRY → amber
//   OMNILIFE → violet | PERFUME → fuchsia | SHOES → orange | WATCHES → sky

export function getProductCategoryColor(categoryName?: string): string {
  switch (categoryName?.toUpperCase()) {
    case 'BAGS':
      return 'bg-rose-100 text-rose-700';
    case 'BELTS':
      return 'bg-teal-100 text-teal-700';
    case 'CLOTHES':
      return 'bg-indigo-100 text-indigo-700';
    case 'JEWELRY':
      return 'bg-amber-100 text-amber-700';
    case 'OMNILIFE':
      return 'bg-violet-100 text-violet-700';
    case 'PERFUME':
      return 'bg-fuchsia-100 text-fuchsia-700';
    case 'SHOES':
      return 'bg-orange-100 text-orange-700';
    case 'WATCHES':
      return 'bg-sky-100 text-sky-700';
    default:
      return 'bg-gray-100 text-gray-400';
  }
}

// ─── Subcategorías de Producto ───────────────────────────────────────
// Cada subcategoría hereda la familia de color de su categoría padre,
// variando la intensidad del fondo (50→300) para distinguirlas entre sí.

export function getProductSubcategoryColor(subcategoryName?: string): string {
  switch (subcategoryName?.toUpperCase()) {
    // CLOTHES → familia indigo
    case 'BLOUSE':
      return 'bg-indigo-50 text-indigo-600';
    case 'COVERALL':
      return 'bg-indigo-100 text-indigo-700';
    case 'DRESS':
      return 'bg-indigo-200 text-indigo-700';
    case 'JACKET':
      return 'bg-indigo-300 text-indigo-800';
    case 'KIDS_CLOTHES':
      return 'bg-indigo-50 text-indigo-700';
    case 'LEGGINGS':
      return 'bg-indigo-100 text-indigo-600';
    case 'MAN_SHIRT':
      return 'bg-indigo-200 text-indigo-800';
    case 'PANTS':
      return 'bg-indigo-300 text-indigo-900';
    case 'SHORT':
      return 'bg-indigo-100 text-indigo-800';
    case 'SKIRT':
      return 'bg-indigo-200 text-indigo-600';
    // SHOES → familia orange
    case 'BARGAIN_SHOES':
      return 'bg-orange-50 text-orange-600';
    case 'BOOTS':
      return 'bg-orange-100 text-orange-700';
    case 'LADY_SHOES':
      return 'bg-orange-200 text-orange-800';
    case 'MAN_SHOES':
      return 'bg-orange-300 text-orange-900';
    // JEWELRY → familia amber
    case 'GOLFI_GOLD':
      return 'bg-amber-50 text-amber-600';
    case 'LAMINATED_GOLD':
      return 'bg-amber-100 text-amber-700';
    case 'RHODIUM':
      return 'bg-amber-200 text-amber-800';
    case 'SILVER':
      return 'bg-amber-300 text-amber-900';
    case 'STEEL':
      return 'bg-amber-100 text-amber-600';
    default:
      return 'bg-gray-100 text-gray-400';
  }
}
