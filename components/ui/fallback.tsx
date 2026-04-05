interface FallbackProps {
  message?: string;
  variant?: "spinner" | "skeleton";
}

function SkeletonCell({ className = "" }: { className?: string }) {
  return (
    <div className={`h-4 rounded bg-gray-200 animate-pulse ${className}`} />
  );
}

function SkeletonRow({ striped }: { striped?: boolean }) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 border-b border-gray-100 ${striped ? "bg-gray-50" : "bg-white"}`}
    >
      {/* Checkbox */}
      <div className="w-4 h-4 rounded bg-gray-200 animate-pulse shrink-0" />
      {/* Col 1 — wide */}
      <SkeletonCell className="flex-2 min-w-0" />
      {/* Col 2 */}
      <SkeletonCell className="flex-1 min-w-0 hidden sm:block" />
      {/* Col 3 */}
      <SkeletonCell className="flex-1 min-w-0 hidden md:block" />
      {/* Col 4 — narrow */}
      <SkeletonCell className="w-16 shrink-0 hidden lg:block" />
      {/* Actions */}
      <div className="flex gap-1 shrink-0">
        <div className="w-6 h-6 rounded bg-gray-200 animate-pulse" />
        <div className="w-6 h-6 rounded bg-gray-200 animate-pulse" />
      </div>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-white">
        <div className="w-4 h-4 rounded bg-gray-300 animate-pulse shrink-0" />
        <SkeletonCell className="flex-2 min-w-0 bg-gray-300" />
        <SkeletonCell className="flex-1 min-w-0 bg-gray-300 hidden sm:block" />
        <SkeletonCell className="flex-1 min-w-0 bg-gray-300 hidden md:block" />
        <SkeletonCell className="w-16 shrink-0 bg-gray-300 hidden lg:block" />
        <div className="w-14 shrink-0" />
      </div>

      {/* Rows */}
      {Array.from({ length: 20 }).map((_, i) => (
        <SkeletonRow key={i} striped={i % 2 !== 0} />
      ))}
    </div>
  );
}

export default function Fallback({
  message,
  variant = "spinner",
}: FallbackProps) {
  if (variant === "skeleton") {
    return <TableSkeleton />;
  }

  return (
    <div className="min-h-75 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f37ca8]" />
        <span className="text-gray-500">{message || "Cargando..."}</span>
      </div>
    </div>
  );
}
