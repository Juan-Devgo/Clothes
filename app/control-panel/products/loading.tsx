import BoxIcon from "@/components/icons/box";
import Fallback from "@/components/ui/fallback";

export default function ProductsLoading() {
  return (
    <section className="flex flex-col flex-1 min-h-0">
      <div className="ml-2 sm:ml-4 my-4 sm:my-6 md:my-8 flex gap-2 items-center">
        <BoxIcon className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600" />
        <h2 className="text-xl sm:text-2xl md:text-3xl text-left font-bold">
          Registros de Productos
        </h2>
      </div>
      <div className="flex flex-col flex-1 min-h-0">
        <div className="flex items-center gap-2 mb-4 px-2 animate-pulse">
          <div className="h-9 w-48 bg-gray-200 rounded" />
          <div className="h-9 w-24 bg-gray-200 rounded" />
          <div className="ml-auto h-9 w-32 bg-gray-200 rounded" />
        </div>
        <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden">
          <Fallback variant="skeleton" />
        </div>
      </div>
    </section>
  );
}
