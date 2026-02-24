import { getProductsAction } from '@/actions/products';
import { ProductTableProvider } from '@/components/providers/product-table-provider';
import ProductsTable from '@/components/tables/products-table';
import { Product } from '@/types';

export default async function Products() {
  const data = (await getProductsAction()) as Product[];

  return (
    <>
      <section>
        <ProductTableProvider>
          <ProductsTable data={data} />
        </ProductTableProvider>
      </section>
    </>
  );
}
