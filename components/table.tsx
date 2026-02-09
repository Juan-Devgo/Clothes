'use client';

import { Column, Filter } from '@/types';
import { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import FiltersTable from './filters-table';
import CreateRecordTable from './create-record-table';

interface TableProps<T> {
  title?: string;
  columns: Column[];
  filterableColumns?: Filter[];
  data: T[];
  selectableRows?: boolean;
  pagination?: { active: boolean; perPage?: number };
  onSelectedRowsChange?: (selectedRows: T[]) => void;
  createRecordComponentTitle?: string;
  createRecordComponent: React.ReactNode;
  setCreateModalOpen: (open: boolean) => void;
}

export default function Table<T>({
  title,
  columns,
  filterableColumns,
  data,
  selectableRows = true,
  pagination = { active: false },
  onSelectedRowsChange,
  createRecordComponent,
  setCreateModalOpen,
}: TableProps<T>) {
  const [records, setRecords] = useState<T[]>(data);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-800">
        <strong>Cargando Tabla...</strong>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <FiltersTable
          allFilters={filterableColumns ?? []}
          data={data}
          records={records}
          setRecords={setRecords}
        />
        {title && <h2 className="text-3xl text-center font-bold">{title}</h2>}
        <CreateRecordTable
          renderValue={createRecordComponent}
          setCreateModalOpen={setCreateModalOpen}
        />
      </div>
      <DataTable
        fixedHeader
        columns={columns}
        data={records}
        selectableRows={selectableRows}
        pagination={pagination?.active}
        paginationPerPage={pagination?.perPage}
        onSelectedRowsChange={(data) =>
          onSelectedRowsChange && onSelectedRowsChange(data.selectedRows)
        }
      ></DataTable>
    </>
  );
}
