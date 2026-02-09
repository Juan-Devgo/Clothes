'use client';

import Table from '../table';
import { Sale } from '@/types/domain/types';

interface AccountSalesTabProps {
  sales: Sale[];
}

export default function AccountSalesTab({ sales }: AccountSalesTabProps) {
  const columns = [
    {
      name: 'Monto Total',
      selector: (row: Sale) => `${row.currency} ${row.amount.toLocaleString()}`,
      sortable: true,
    },
    {
      name: 'Método de Pago',
      selector: (row: Sale) => row.method?.type || '-',
      sortable: true,
    },
    {
      name: 'Estado',
      selector: (row: Sale) => row.state?.name || '-',
      sortable: true,
    },
    {
      name: 'Productos',
      selector: (row: Sale) => row.products_details?.length || 0,
      sortable: true,
    },
    {
      name: 'Descripción',
      selector: (row: Sale) => row.description || '-',
    },
    {
      name: 'Fecha',
      selector: (row: Sale) => {
        if (!row.created_at) return '-';
        return new Date(row.created_at).toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });
      },
      sortable: true,
    },
  ];

  const filterableColumns = [
    { id: 1, column: 'amount', name: 'Monto' },
    { id: 2, column: 'description', name: 'Descripción' },
  ];

  if (sales.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-500">
        <p>No hay ventas registradas para este cliente.</p>
      </div>
    );
  }

  return (
    <Table
      columns={columns}
      filterableColumns={filterableColumns}
      data={sales}
      selectableRows={false}
      pagination={{ active: true, perPage: 5 }}
      createRecordComponent={null}
    />
  );
}
