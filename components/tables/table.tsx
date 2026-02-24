'use client';

import { Column, Filter } from '@/types';
import { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import CreateRecordTable from './create-record-table';
import FiltersTable from './filters-table';
import Fallback from '../ui/fallback';

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
  setCreateModalOpen?: (open: boolean) => void;
  pendingText?: string;
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
  pendingText = 'Cargando datos...',
}: TableProps<T>) {
  const [records, setRecords] = useState<T[]>(data);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const paginationComponentOptions = {
    rowsPerPageText: 'Filas por página',
    rangeSeparatorText: 'de',
    selectAllRowsItem: true,
    selectAllRowsItemText: 'Todos',
  };

  if (!mounted) {
    return <Fallback message={pendingText} />;
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
          setCreateModalOpen={setCreateModalOpen ?? (() => {})}
        />
      </div>
      <DataTable
        fixedHeader
        columns={columns}
        data={records}
        pagination={pagination?.active}
        paginationPerPage={pagination?.perPage}
        selectableRows={selectableRows}
        onSelectedRowsChange={(data) =>
          onSelectedRowsChange && onSelectedRowsChange(data.selectedRows)
        }
        customStyles={{
          head: {
            style: {
              fontSize: '16px',
              fontWeight: 600,
            },
          },
          headCells: {
            style: {
              paddingLeft: '16px',
              paddingRight: '16px',
            },
          },
        }}
        paginationComponentOptions={paginationComponentOptions}
        progressPending={!data}
      ></DataTable>
    </>
  );
}
