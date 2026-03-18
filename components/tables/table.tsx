'use client';

import { Column, Filter } from '@/types';
import { useState, useEffect, useSyncExternalStore } from 'react';
import DataTable from 'react-data-table-component';
import CreateRecordTable from './create-record-table';
import FiltersTable from './filters-table';
import Fallback from '../ui/fallback';
import UploadDataTable from './upload-data-table';
import DownloadDataTable from './download-data-table';
import EditIcon from '../icons/edit';
import DeleteIcon from '../icons/delete';
import { DownloadIcon } from '../icons/download';

type BulkAction = 'edit' | 'delete' | 'download';

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
  uploadComponent?: React.ReactNode;
  setUploadModalOpen?: (open: boolean) => void;
  downloadComponent?: React.ReactNode;
  setDownloadModalOpen?: (open: boolean) => void;
  pendingText?: string;
  /** Al cambiar su valor, limpia la selección del DataTable */
  clearSelectedRows?: boolean;
  /** Acciones habilitadas para la selección masiva */
  allowedBulkActions?: BulkAction[];
  bulkEditComponent?: React.ReactNode;
  setBulkEditModalOpen?: (open: boolean) => void;
  bulkDeleteComponent?: React.ReactNode;
  setBulkDeleteModalOpen?: (open: boolean) => void;
  bulkDownloadComponent?: React.ReactNode;
  setBulkDownloadModalOpen?: (open: boolean) => void;
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
  uploadComponent,
  setUploadModalOpen,
  downloadComponent,
  setDownloadModalOpen,
  pendingText = 'Cargando datos...',
  clearSelectedRows = false,
  allowedBulkActions = [],
  bulkEditComponent,
  setBulkEditModalOpen,
  bulkDeleteComponent,
  setBulkDeleteModalOpen,
  bulkDownloadComponent,
  setBulkDownloadModalOpen,
}: TableProps<T>) {
  const [records, setRecords] = useState<T[]>(data);
  const [selectedCount, setSelectedCount] = useState(0);
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);

  useEffect(() => {
    setSelectedCount(0);
  }, [clearSelectedRows]);

  const paginationComponentOptions = {
    rowsPerPageText: 'Filas por página',
    rangeSeparatorText: 'de',
    selectAllRowsItem: true,
    selectAllRowsItemText: 'Todos',
  };

  if (!mounted) {
    return <Fallback message={pendingText} />;
  }

  const hasSelection = selectedCount > 0;

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

        <div className="flex items-center justify-center mb-2 gap-3">
          {hasSelection ? (
            /* ── Bulk action buttons ─────────────────────── */
            <>
              <span className="text-sm text-gray-500 font-medium">
                {selectedCount} seleccionados
              </span>

              {allowedBulkActions.includes('edit') && (
                <>
                  <button
                    className="bg-blue-500 text-white font-semibold px-3 py-1.5 rounded-md hover:bg-blue-600 items-center justify-center flex gap-0.5 cursor-pointer transition-colors"
                    onClick={() => setBulkEditModalOpen?.(true)}
                  >
                    <EditIcon />
                    Editar selección
                  </button>
                  {bulkEditComponent}
                </>
              )}

              {allowedBulkActions.includes('delete') && (
                <>
                  <button
                    className="bg-red-500 text-white font-semibold px-3 py-1.5 rounded-md hover:bg-red-600 items-center justify-center flex gap-0.5 cursor-pointer transition-colors"
                    onClick={() => setBulkDeleteModalOpen?.(true)}
                  >
                    <DeleteIcon />
                    Eliminar selección
                  </button>
                  {bulkDeleteComponent}
                </>
              )}

              {allowedBulkActions.includes('download') && (
                <>
                  <button
                    className="bg-indigo-500 text-white font-semibold px-3 py-1.5 rounded-md hover:bg-indigo-600 items-center justify-center flex gap-0.5 cursor-pointer transition-colors"
                    onClick={() => setBulkDownloadModalOpen?.(true)}
                  >
                    <DownloadIcon />
                    Descargar selección
                  </button>
                  {bulkDownloadComponent}
                </>
              )}
            </>
          ) : (
            /* ── Normal action buttons ───────────────────── */
            <>
              <CreateRecordTable
                renderValue={createRecordComponent}
                setCreateModalOpen={setCreateModalOpen ?? (() => {})}
              />
              <UploadDataTable
                renderValue={uploadComponent}
                setUploadModalOpen={setUploadModalOpen ?? (() => {})}
              />
              <DownloadDataTable
                renderValue={downloadComponent}
                setDownloadModalOpen={setDownloadModalOpen}
              />
            </>
          )}
        </div>
      </div>

      <DataTable
        fixedHeader
        columns={columns}
        data={records}
        pagination={pagination?.active}
        paginationPerPage={pagination?.perPage}
        selectableRows={selectableRows}
        clearSelectedRows={clearSelectedRows}
        onSelectedRowsChange={(state) => {
          setSelectedCount(state.selectedRows.length);
          onSelectedRowsChange?.(state.selectedRows);
        }}
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
      />
    </>
  );
}
