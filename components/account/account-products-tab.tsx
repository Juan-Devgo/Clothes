'use client';

import Table from '../table';
import { Product } from '@/types/domain/types';

interface AccountProductsTabProps {
  products: Product[];
}

export default function AccountProductsTab({
  products,
}: AccountProductsTabProps) {
  const columns = [
    {
      name: 'Producto',
      selector: (row: Product) => row.name,
      sortable: true,
    },
    {
      name: 'Precio',
      selector: (row: Product) =>
        `${row.currency} ${row.price.toLocaleString()}`,
      sortable: true,
    },
    {
      name: 'Categoría',
      selector: (row: Product) => row.category?.name || '-',
      sortable: true,
    },
    {
      name: 'Estado',
      selector: (row: Product) => row.state?.name || '-',
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
