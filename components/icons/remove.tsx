interface RemoveIconProps {
  className?: string;
}

export default function RemoveIcon({ className }: RemoveIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="currentColor"
      className={className || 'w-6 h-6'}
      viewBox="0 -960 960 960"
    >
      <path d="M200-440v-80h560v80z" />
    </svg>
  );
}
