"use client";

import { Column, Filter, SortableColumn } from "@/types";
import { useState, useSyncExternalStore } from "react";
import DataTable from "react-data-table-component";
import { StyleSheetManager } from "styled-components";
import isPropValid from "@emotion/is-prop-valid";
import CreateRecordTable from "./create-record-table";
import FiltersTable from "./filters-table";
import Fallback from "../ui/fallback";
import UploadDataTable from "./upload-data-table";
import DownloadDataTable from "./download-data-table";
import BulkDownloadTable from "./bulk-download-table";
import BulkDeleteTable from "./bulk-delete-table";
import BulkEditTable from "./bulk-edit-table";

type BulkAction = "edit" | "delete" | "download";

interface ServerSideConfig {
  totalRows: number;
  loading: boolean;
  onPageChange: (page: number, totalRows: number) => void;
  onPerPageChange: (perPage: number, page: number) => void;
  onSort: (column: SortableColumn, direction: "asc" | "desc") => void;
}

interface TableProps<T> {
  title?: string;
  columns: Column<T>[];
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
  /** Campo que actúa como clave única de cada fila (default: 'id') */
  keyField?: string;
  /** ID o IDs de las filas recién modificadas; se resaltan con animación */
  modifiedRowId?: string | number | (string | number)[] | null;
  /** Acciones habilitadas para la selección masiva */
  allowedBulkActions?: BulkAction[];
  bulkEditComponent?: React.ReactNode;
  setBulkEditModalOpen?: (open: boolean) => void;
  bulkDeleteComponent?: React.ReactNode;
  setBulkDeleteModalOpen?: (open: boolean) => void;
  bulkDownloadComponent?: React.ReactNode;
  setBulkDownloadModalOpen?: (open: boolean) => void;
  /** Configuración server-side (opt-in) */
  serverSide?: ServerSideConfig;
  onServerSearch?: (query: string, activeFilterColumns: string[]) => void;
  /** Mensaje cuando no hay resultados de búsqueda */
  noSearchResultsMessage?: string;
}

export default function Table<T>({
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
  clearSelectedRows = false,
  keyField = "id",
  modifiedRowId = null,
  allowedBulkActions = [],
  bulkEditComponent,
  setBulkEditModalOpen,
  bulkDeleteComponent,
  setBulkDeleteModalOpen,
  bulkDownloadComponent,
  setBulkDownloadModalOpen,
  serverSide,
  onServerSearch,
  noSearchResultsMessage = "No hay resultados en la búsqueda",
}: TableProps<T>) {
  const [records, setRecords] = useState<T[]>(data);
  const [selectedCount, setSelectedCount] = useState(0);
  const [prevClearSelectedRows, setPrevClearSelectedRows] =
    useState(clearSelectedRows);

  if (prevClearSelectedRows !== clearSelectedRows) {
    setPrevClearSelectedRows(clearSelectedRows);
    setSelectedCount(0);
  }

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const paginationComponentOptions = {
    rowsPerPageText: "Filas por página",
    rangeSeparatorText: "de",
    selectAllRowsItem: !serverSide,
    selectAllRowsItemText: "Todos",
  };

  if (!mounted) {
    return <Fallback variant="skeleton" />;
  }

  const hasSelection = selectedCount > 0;
  const isServerSide = !!serverSide;
  const tableData = isServerSide ? data : records;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex flex-wrap items-center justify-between mb-2 gap-2">
        <FiltersTable
          allFilters={filterableColumns ?? []}
          data={data}
          records={records}
          setRecords={setRecords}
          onServerSearch={isServerSide ? onServerSearch : undefined}
        />

        <div className="flex items-center justify-center mb-2 gap-1 sm:gap-3">
          {hasSelection ? (
            /* ── Bulk action buttons ─────────────────────── */
            <>
              <span className="text-xs sm:text-sm text-gray-500 font-medium whitespace-nowrap">
                {selectedCount} seleccionados
              </span>

              {allowedBulkActions.includes("edit") && (
                <BulkEditTable
                  renderValue={bulkEditComponent}
                  setBulkEditModalOpen={setBulkEditModalOpen ?? (() => {})}
                />
              )}

              {allowedBulkActions.includes("delete") && (
                <BulkDeleteTable
                  renderValue={bulkDeleteComponent}
                  setBulkDeleteModalOpen={setBulkDeleteModalOpen ?? (() => {})}
                />
              )}

              {allowedBulkActions.includes("download") && (
                <BulkDownloadTable
                  renderValue={bulkDownloadComponent}
                  setBulkDownloadModalOpen={
                    setBulkDownloadModalOpen ?? (() => {})
                  }
                />
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

      <div className="flex-1 min-h-0 flex flex-col rounded-md border border-gray-200 overflow-hidden">
        <StyleSheetManager shouldForwardProp={isPropValid}>
        <DataTable
          fixedHeader
          fixedHeaderScrollHeight="100%"
          striped
          keyField={keyField}
          columns={columns}
          data={tableData}
          pagination={isServerSide ? true : pagination?.active}
          paginationPerPage={pagination?.perPage}
          paginationServer={isServerSide}
          paginationTotalRows={serverSide?.totalRows}
          onChangePage={serverSide?.onPageChange}
          onChangeRowsPerPage={serverSide?.onPerPageChange}
          sortServer={isServerSide}
          onSort={serverSide?.onSort}
          selectableRows={selectableRows}
          clearSelectedRows={clearSelectedRows}
          onSelectedRowsChange={(state) => {
            setSelectedCount(state.selectedRows.length);
            onSelectedRowsChange?.(state.selectedRows);
          }}
          conditionalRowStyles={
            modifiedRowId != null
              ? [
                  {
                    when: (row) => {
                      const rowKey = (row as Record<string, unknown>)[keyField];
                      return Array.isArray(modifiedRowId)
                        ? (modifiedRowId as (string | number)[]).includes(
                            rowKey as string | number,
                          )
                        : rowKey === modifiedRowId;
                    },
                    classNames: ["row-highlight-animation"],
                  },
                ]
              : []
          }
          customStyles={{
            table: {
              style: {
                height: "100%",
                display: "flex",
                flexDirection: "column",
              },
            },
            tableWrapper: {
              style: {
                flex: "1",
                overflow: "hidden",
              },
            },
            head: {
              style: {
                fontSize: "16px",
                fontWeight: 600,
              },
            },
            headCells: {
              style: {
                paddingLeft: "16px",
                paddingRight: "16px",
              },
            },
            rows: {
              style: {
                minHeight: "52px",
                maxHeight: "52px",
              },
              stripedStyle: {
                backgroundColor: "#f3f4f6",
              },
            },
          }}
          paginationComponentOptions={paginationComponentOptions}
          noDataComponent={
            <div className="py-8 text-center text-gray-500">
              {noSearchResultsMessage}
            </div>
          }
          progressPending={isServerSide ? serverSide.loading : !data}
          progressComponent={<Fallback variant="skeleton" />}
        />
        </StyleSheetManager>
      </div>
    </div>
  );
}
