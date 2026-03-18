'use client';

import Table from '@/components/tables/table';
import { ProductDetail } from '@/types';

interface AccountProductsTabProps {
  products: ProductDetail[];
}

export default function AccountProductsTab({
  products,
}: AccountProductsTabProps) {
  const columns = [
    {
      name: 'Producto',
      selector: (row: ProductDetail) => row.product?.name,
      sortable: true,
    },
    {
      name: 'Precio',
      selector: (row: ProductDetail) =>
        `${row.product?.currency} ${row.product?.price.toLocaleString()}`,
      sortable: true,
    },
    {
      name: 'Categoría',
      selector: (row: ProductDetail) => row.product?.category?.name || '-',
      sortable: true,
    },
    {
      name: 'Estado',
      selector: (row: ProductDetail) => row.state?.name || '-',
      sortable: true,
    },
  ];

  const filterableColumns = [{ id: 1, column: 'name', name: 'Nombre' }];

  if (products.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-500">
        <p>No hay productos asociados a esta cuenta.</p>
      </div>
    );
  }

  return (
    <Table
      columns={columns}
      filterableColumns={filterableColumns}
      data={products}
      selectableRows={false}
      pagination={{ active: true, perPage: 5 }}
      createRecordComponent={null}
    />
  );
}
