'use client';

import Table from '../table';
import { AccountPayment } from '@/types/domain/types';

interface AccountPaymentsTabProps {
  payments: AccountPayment[];
}

export default function AccountPaymentsTab({
  payments,
}: AccountPaymentsTabProps) {
  const columns = [
    {
      name: 'Monto',
      selector: (row: AccountPayment) =>
        `${row.currency} ${row.amount.toLocaleString()}`,
      sortable: true,
    },
    {
      name: 'Método de Pago',
      selector: (row: AccountPayment) => row.method?.type || '-',
      sortable: true,
    },
    {
      name: 'Fecha',
      selector: (row: AccountPayment) => {
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

  const filterableColumns = [{ id: 1, column: 'amount', name: 'Monto' }];

  if (payments.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-500">
        <p>No hay pagos registrados en esta cuenta.</p>
      </div>
    );
  }

  return (
    <Table
      columns={columns}
      filterableColumns={filterableColumns}
      data={payments}
      selectableRows={false}
      pagination={{ active: true, perPage: 5 }}
      createRecordComponent={null}
    />
  );
}
