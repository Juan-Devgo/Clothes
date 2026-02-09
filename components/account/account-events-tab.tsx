'use client';

import Table from '../table';
import { Event } from '@/types/domain/types';

interface AccountEventsTabProps {
  events: Event[];
}

export default function AccountEventsTab({ events }: AccountEventsTabProps) {
  const columns = [
    {
      name: 'Evento',
      selector: (row: Event) => row.name,
      sortable: true,
    },
    {
      name: 'Descripción',
      selector: (row: Event) => row.description || '-',
    },
    {
      name: 'Fecha Inicio',
      selector: (row: Event) => {
        if (!row.valid_from) return '-';
        return new Date(row.valid_from).toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });
      },
      sortable: true,
    },
    {
      name: 'Fecha Fin',
      selector: (row: Event) => {
        if (!row.valid_to) return '-';
        return new Date(row.valid_to).toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });
      },
      sortable: true,
    },
    {
      name: 'Participantes',
      selector: (row: Event) => row.customers?.length || 0,
      sortable: true,
    },
  ];

  const filterableColumns = [
    { id: 1, column: 'name', name: 'Nombre' },
    { id: 2, column: 'description', name: 'Descripción' },
  ];

  if (events.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-500">
        <p>No hay eventos registrados para este cliente.</p>
      </div>
    );
  }

  return (
    <Table
      columns={columns}
      filterableColumns={filterableColumns}
      data={events}
      selectableRows={false}
      pagination={{ active: true, perPage: 5 }}
      createRecordComponent={null}
    />
  );
}
