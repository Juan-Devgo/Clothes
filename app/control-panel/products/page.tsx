import { getProductsPaginatedAction } from "@/actions/products";
import { ProductTableProvider } from "@/components/providers/product-table-provider";
import ProductsTable from "@/components/products/tables/products-table";
import BoxIcon from "@/components/icons/box";

export default async function Products() {
  const result = await getProductsPaginatedAction({ page: 1, pageSize: 20 });

  return (
    <section className="flex flex-col flex-1 min-h-0">
      <div className="ml-2 sm:ml-4 my-4 sm:my-6 md:my-8 flex gap-2 items-center">
        <BoxIcon className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600" />
        <h2 className="text-xl sm:text-2xl md:text-3xl text-left font-bold">
          Registros de Productos
        </h2>
      </div>
      <ProductTableProvider>
        <ProductsTable
          initialData={result.data}
          initialTotal={result.total}
          initialPage={result.page}
          initialPageSize={result.pageSize}
        />
      </ProductTableProvider>
    </section>
  );
}
