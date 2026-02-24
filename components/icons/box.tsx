interface BoxIconProps {
  className?: string;
}

export default function BoxIcon({ className }: BoxIconProps) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      className={className || 'w-6 h-6'}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m20 7-8-4-8 4m16 0-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        strokeWidth={2}
      />
    </svg>
  );
}
