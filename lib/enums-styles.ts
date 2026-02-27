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
    // CLOTHES
    case 'BLOUSE':
      return 'bg-indigo-100 text-indigo-800';
    case 'COVERALL':
      return 'bg-blue-100 text-blue-800';
    case 'DRESS':
      return 'bg-violet-100 text-violet-800';
    case 'JACKET':
      return 'bg-slate-100 text-slate-800';
    case 'KIDS_CLOTHES':
      return 'bg-sky-100 text-sky-800';
    case 'LEGGINGS':
      return 'bg-cyan-100 text-cyan-800';
    case 'MAN_SHIRT':
      return 'bg-teal-100 text-teal-800';
    case 'PANTS':
      return 'bg-indigo-200 text-indigo-900';
    case 'SHORT':
      return 'bg-blue-200 text-blue-900';
    case 'SKIRT':
      return 'bg-purple-100 text-purple-800';
    // SHOES
    case 'BARGAIN_SHOES':
      return 'bg-red-100 text-red-800';
    case 'BOOTS':
      return 'bg-orange-100 text-orange-800';
    case 'LADY_SHOES':
      return 'bg-pink-100 text-pink-800';
    case 'MAN_SHOES':
      return 'bg-rose-100 text-rose-800';
    // JEWELRY
    case 'GOLFI_GOLD':
      return 'bg-yellow-100 text-yellow-800';
    case 'LAMINATED_GOLD':
      return 'bg-amber-100 text-amber-800';
    case 'RHODIUM':
      return 'bg-zinc-100 text-zinc-800';
    case 'SILVER':
      return 'bg-stone-100 text-stone-800';
    case 'STEEL':
      return 'bg-neutral-200 text-neutral-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
