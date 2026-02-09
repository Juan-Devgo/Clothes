interface PersonIconProps {
  color?: string;
  size?: string;
}

export default function PersonIcon({ color, size }: PersonIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      stroke="currentColor"
      className={`w-${size || 8} h-${size || 8} text-${color || 'blue-600'}`}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0m-4 7a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7"
        strokeWidth={2}
      />
    </svg>
  );
}
