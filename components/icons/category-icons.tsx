interface CategoryIconProps {
  className?: string;
}

export function BagsIcon({ className }: CategoryIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      stroke="currentColor"
      className={className || 'w-6 h-6'}
      strokeWidth={1.5}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007M8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0m7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0"
      />
    </svg>
  );
}

export function BeltsIcon({ className }: CategoryIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="64"
      height="64"
      viewBox="0 0 64 64"
      className={className || 'w-6 h-6'}
    >
      <rect
        width="52"
        height="12"
        x="6"
        y="26"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        rx="6"
      />
      <rect width="12" height="16" x="32" y="24" fill="none" rx="2" />
      <rect
        width="16"
        height="20"
        x="30"
        y="22"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        rx="3"
      />
      <rect
        width="8"
        height="12"
        x="34"
        y="26"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        rx="2"
      />
      <circle cx="14" cy="32" r="2" fill="currentColor" />
      <circle cx="20" cy="32" r="2" fill="currentColor" />
    </svg>
  );
}

export function ClothesIcon({ className }: CategoryIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="currentColor"
      className={className || 'w-6 h-6'}
      viewBox="0 -960 960 960"
    >
      <path d="m240-522-40 22q-14 8-30 4t-24-18L66-654q-8-14-4-30t18-24l230-132h70q9 0 14.5 5.5T400-820v20q0 33 23.5 56.5T480-720t56.5-23.5T560-800v-20q0-9 5.5-14.5T580-840h70l230 132q14 8 18 24t-4 30l-80 140q-8 14-23.5 17.5T760-501l-40-20v361q0 17-11.5 28.5T680-120H280q-17 0-28.5-11.5T240-160zm80-134v456h320v-456l124 68 42-70-172-100q-15 51-56.5 84.5T480-640t-97.5-33.5T326-758L154-658l42 70zm160 177" />
    </svg>
  );
}

export function JewelryIcon({ className }: CategoryIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className={className || 'w-6 h-6'}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
      />
    </svg>
  );
}

export function OmnilifeIcon({ className }: CategoryIconProps) {
  return <span className={`font-bold ${className || 'text-base'}`}>O</span>;
}

export function PerfumeIcon({ className }: CategoryIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="24px"
      viewBox="0 -960 960 960"
      width="24px"
      fill="currentColor"
      className={className || 'w-6 h-6'}
    >
      <path d="M560-640q-17 0-28.5-11.5T520-680q0-17 11.5-28.5T560-720q17 0 28.5 11.5T600-680q0 17-11.5 28.5T560-640Zm240 0q-17 0-28.5-11.5T760-680q0-17 11.5-28.5T800-720q17 0 28.5 11.5T840-680q0 17-11.5 28.5T800-640Zm-120-80q-17 0-28.5-11.5T640-760q0-17 11.5-28.5T680-800q17 0 28.5 11.5T720-760q0 17-11.5 28.5T680-720Zm120-80q-17 0-28.5-11.5T760-840q0-17 11.5-28.5T800-880q17 0 28.5 11.5T840-840q0 17-11.5 28.5T800-800ZM680-560q-17 0-28.5-11.5T640-600q0-17 11.5-28.5T680-640q17 0 28.5 11.5T720-600q0 17-11.5 28.5T680-560Zm120 80q-17 0-28.5-11.5T760-520q0-17 11.5-28.5T800-560q17 0 28.5 11.5T840-520q0 17-11.5 28.5T800-480ZM200-200h240v-320H200v320Zm-80 80v-400q0-33 23.5-56.5T200-600h240q33 0 56.5 23.5T520-520v400H120Zm80-480v-160q0-33 23.5-56.5T280-840h160v240h-80v-160h-80v160h-80Zm0 400h240-240Z" />
    </svg>
  );
}

export function ShoesIcon({ className }: CategoryIconProps) {
  return (
    <svg
      className={className || 'w-6 h-6'}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="currentColor"
      viewBox="0 -960 960 960"
    >
      <path d="M216-580q39 0 74 14t64 41l382 365h24q17 0 28.5-11.5T800-200q0-8-1.5-17T788-235L605-418l-71-214-74 18q-38 10-69-14t-31-63v-84l-28-14-154 206q-1 1-1 1.5t-1 1.5zm0 80h-46q3 7 7.5 13t10.5 11l324 295q11 11 25 16t29 5h54L299-467q-17-17-38.5-25t-44.5-8M566-80q-30 0-57-11t-50-31L134-417q-46-42-51.5-103T114-631l154-206q17-23 45.5-30.5T368-861l28 14q21 11 32.5 30t11.5 42v84l74-19q30-8 58 7.5t38 44.5l65 196 170 170q20 20 27.5 43t7.5 49q0 50-35 85t-85 35z" />
    </svg>
  );
}

export function WatchesIcon({ className }: CategoryIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="currentColor"
      className={className || 'w-6 h-6'}
      viewBox="0 -960 960 960"
    >
      <path d="M420-800h120zm0 640h120zm-60 80-54-182q-48-38-77-95t-29-123 29-123 77-95l54-182h240l54 182q48 38 77 95t29 123-29 123-77 95L600-80zm261.5-258.5Q680-397 680-480t-58.5-141.5T480-680t-141.5 58.5T280-480t58.5 141.5T480-280t141.5-58.5M404-750q20-5 38.5-8t37.5-3 37.5 3 38.5 8l-16-50H420zm16 590h120l16-50q-20 5-38.5 7.5T480-200t-37.5-2.5T404-210z" />
    </svg>
  );
}

/**
 * Retorna el ícono correspondiente a la categoría del producto
 */
export function getCategoryIcon(categoryName?: string): React.ReactNode {
  switch (categoryName?.toUpperCase()) {
    case 'BAGS':
      return <BagsIcon />;
    case 'BELTS':
      return <BeltsIcon />;
    case 'CLOTHES':
      return <ClothesIcon />;
    case 'JEWELRY':
      return <JewelryIcon />;
    case 'OMNILIFE':
      return <OmnilifeIcon />;
    case 'PERFUME':
      return <PerfumeIcon />;
    case 'SHOES':
      return <ShoesIcon />;
    case 'WATCHES':
      return <WatchesIcon />;
    default:
      return <BagsIcon />;
  }
}
