"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import DeleteIcon from "@/components/icons/delete";
import EditIcon from "@/components/icons/edit";
import LinkIcon from "@/components/icons/link";
import Table from "@/components/tables/table";
import Modal from "@/components/ui/modal";
import type { TableColumn } from "react-data-table-component";
import { Customer } from "@/types";
import { useCustomerTable } from "@/components/providers/customer-table-provider";
import { useDeleteCustomer } from "@/hooks/customers";
import { useGetAccount } from "@/hooks/accounts";
import AccountSkeleton from "@/components/customers/account/account-skeleton";
import AccountError from "@/components/customers/account/account-error";
import CreateRecordTable from "@/components/tables/create-record-table";
import BulkDeleteModal from "@/components/tables/bulk-delete-modal";
import {
  useBulkUploadCustomers,
  useBulkDownloadCustomers,
  useBulkDeleteCustomers,
  useBulkEditCustomers,
} from "@/hooks/customers";
import {
  getCustomersPaginatedAction,
  getCustomersAction,
} from "@/actions/customers";
import { useServerTable } from "@/hooks/tables/useServerTable";

// Lazy load heavy components only needed when modals open
const AccountTables = dynamic(
  () => import("@/components/customers/account/account-tables"),
);
const DeleteRecordForm = dynamic(
  () => import("@/components/tables/delete-record-form"),
);
const EditCustomerForm = dynamic(
  () => import("@/components/customers/forms/edit-customer-form"),
);
const UploadDataModal = dynamic(
  () => import("@/components/tables/upload-data-modal"),
);
const DownloadDataModal = dynamic(
  () => import("@/components/tables/download-data-modal"),
);
const UploadDataTable = dynamic(
  () => import("@/components/tables/upload-data-table"),
);

const SEARCH_FIELD_MAP: Record<string, string | null> = {
  first_name: "first_name",
  last_name: "last_name",
  phone: "phone",
  email: "email",
};

interface CustomersTableProps {
  initialData: Customer[];
  initialTotal: number;
  initialPage?: number;
  initialPageSize?: number;
}

export default function CustomersTable({
  initialData,
  initialTotal,
  initialPage = 1,
  initialPageSize = 20,
}: CustomersTableProps) {
  const {
    editModalOpen,
    createModalOpen,
    deleteModalOpen,
    accountModalOpen,
    uploadModalOpen,
    downloadModalOpen,
    bulkEditModalOpen,
    bulkDeleteModalOpen,
    bulkDownloadModalOpen,
    selectedCustomer,
    selectedAccountId,
    openEditModal,
    openCreateModal,
    openDeleteModal,
    openAccountModal,
    openUploadModal,
    openDownloadModal,
    openBulkEditModal,
    openBulkDeleteModal,
    openBulkDownloadModal,
    closeAllModals,
  } = useCustomerTable();

  const {
    data,
    totalRows,
    loading,
    handlePageChange,
    handlePerPageChange,
    handleSort,
    handleSearch: serverHandleSearch,
    hasActiveSearch,
    refetch,
  } = useServerTable<Customer>({
    fetchAction: getCustomersPaginatedAction,
    initialData,
    initialTotal,
    initialPage,
    initialPageSize,
  });

  const [selectedCustomers, setSelectedCustomers] = useState<Customer[]>([]);
  const [clearSelection, setClearSelection] = useState(false);
  const [modifiedCustomerId, setModifiedCustomerId] = useState<
    string | string[] | null
  >(null);

  const { account, isLoading: isLoadingAccount } = useGetAccount(
    accountModalOpen ? selectedAccountId : null,
  );

  const bulkUploadCustomers = useBulkUploadCustomers();
  const bulkDownloadCustomers = useBulkDownloadCustomers();
  function handleBulkSuccess() {
    closeAllModals();
    setSelectedCustomers([]);
    setClearSelection((prev) => !prev);
    refetch();
  }

  function handleBulkEditSuccess() {
    const ids = selectedCustomers.map((c) => c.documentId!).filter(Boolean);
    handleBulkSuccess();
    if (ids.length > 0) {
      setModifiedCustomerId(null);
      setTimeout(() => {
        setModifiedCustomerId(ids);
        setTimeout(() => setModifiedCustomerId(null), 2500);
      }, 0);
    }
  }

  const bulkDeleteCustomers = useBulkDeleteCustomers({
    onSuccess: handleBulkSuccess,
  });
  const bulkEditCustomers = useBulkEditCustomers({
    documentIds: selectedCustomers.map((c) => c.documentId!).filter(Boolean),
    onSuccess: handleBulkEditSuccess,
  });

  function handleEditSuccess() {
    const id = selectedCustomer?.documentId;
    closeAllModals();
    refetch();
    if (id) {
      setModifiedCustomerId(null);
      setTimeout(() => {
        setModifiedCustomerId(id);
        setTimeout(() => setModifiedCustomerId(null), 2500);
      }, 0);
    }
  }

  function handleCreateSuccess() {
    closeAllModals();
    refetch();
  }

  function handleDeleteSuccess() {
    closeAllModals();
    refetch();
  }

  function handleCloseUploadModal() {
    closeAllModals();
    bulkUploadCustomers.reset();
    refetch();
  }

  function handleSelectedRowsChange(selectedRows: Customer[]) {
    setSelectedCustomers(selectedRows);
  }

  function handleSearch(query: string, activeColumns: string[]) {
    const strapiFields = activeColumns
      .map((col) => SEARCH_FIELD_MAP[col])
      .filter((f): f is string => f !== null);
    serverHandleSearch(query, strapiFields);
  }

  const columns: TableColumn<Customer>[] = [
    {
      name: "Nombre",
      minWidth: "128px",
      selector: (row) => row.first_name,
      cell: (row) => (
        <span className="truncate max-w-36" title={row.first_name}>
          {row.first_name}
        </span>
      ),
      sortable: true,
      sortField: "first_name",
    },
    {
      name: "Apellido",
      minWidth: "128px",
      selector: (row) => row.last_name,
      cell: (row) => (
        <span className="truncate max-w-36" title={row.last_name}>
          {row.last_name}
        </span>
      ),
      sortable: true,
      sortField: "last_name",
    },
    {
      name: "Teléfono",
      minWidth: "140px",
      selector: (row) => row.phone,
      cell: (row) => (
        <span className="truncate max-w-36" title={row.phone}>
          {row.phone}
        </span>
      ),
    },
    {
      name: "Email",
      minWidth: "240px",
      selector: (row) => row.email || "-",
      cell: (row) => (
        <span className="truncate max-w-64" title={row.email || "-"}>
          {row.email || "-"}
        </span>
      ),
    },
    {
      name: "Cumpleaños",
      minWidth: "160px",
      selector: (row) => {
        if (!row.birthdate) return "No proporcionado";
        const date = new Date(row.birthdate + "T00:00:00");
        return date.toLocaleDateString("es-ES", {
          day: "numeric",
          month: "long",
        });
      },
      sortable: true,
      sortField: "birthdate",
    },
    {
      name: "Cuenta",
      minWidth: "140px",
      grow: 0,
      center: true,
      cell: (row) => {
        const account = typeof row.account === "object" ? row.account : null;
        if (!account?.documentId) {
          return "No asignada";
        }
        return (
          <button
            aria-label="Ver cuenta vinculada"
            className="px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-700 cursor-pointer transition-colors max-w-36"
            onClick={() => openAccountModal(row, account.documentId!)}
          >
            <LinkIcon aria-hidden="true" />
          </button>
        );
      },
    },
    {
      name: "Editar",
      button: true,
      minWidth: "140px",
      cell: (row) => (
        <button
          aria-label={`Editar cliente ${row.first_name} ${row.last_name}`}
          className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-700 cursor-pointer transition-colors max-w-36"
          onClick={() => openEditModal(row)}
        >
          <EditIcon aria-hidden="true" />
        </button>
      ),
    },
    {
      name: "Eliminar",
      button: true,
      minWidth: "140px",
      cell: (row) => (
        <button
          aria-label={`Eliminar cliente ${row.first_name} ${row.last_name}`}
          className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-700 cursor-pointer transition-colors max-w-36"
          onClick={() => openDeleteModal(row)}
        >
          <DeleteIcon aria-hidden="true" />
        </button>
      ),
    },
  ];

  const filterableColumns = [
    { id: 1, column: "first_name", name: "Nombre" },
    { id: 2, column: "last_name", name: "Apellido" },
    { id: 3, column: "phone", name: "Teléfono" },
    { id: 4, column: "email", name: "Email" },
  ];

  const defaultCustomer: Customer = {
    id: "",
    documentId: "",
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    birthdate: "",
    tastes: "",
    createdAt: "",
    updatedAt: "",
    publishedAt: "",
  };

  if (totalRows === 0 && !loading && !hasActiveSearch) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500 gap-4">
        <p>No hay clientes registrados.</p>
        <CreateRecordTable
          renderValue={
            <Modal
              isOpen={createModalOpen}
              onClose={closeAllModals}
              title="Nuevo Cliente"
            >
              <EditCustomerForm
                type="create"
                customer={defaultCustomer}
                onSuccess={handleCreateSuccess}
                onCancel={closeAllModals}
              />
            </Modal>
          }
          setCreateModalOpen={openCreateModal}
        />
        <UploadDataTable
          renderValue={
            <Modal
              isOpen={uploadModalOpen}
              onClose={handleCloseUploadModal}
              title="Subida Excel de Clientes"
            >
              <UploadDataModal
                bulkUpload={bulkUploadCustomers}
                entityName="Clientes"
                templateUrl="/excel_templates/clientes.xlsx"
                onClose={handleCloseUploadModal}
              />
            </Modal>
          }
          setUploadModalOpen={openUploadModal}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <Table
        columns={columns}
        filterableColumns={filterableColumns}
        data={data}
        selectableRows={true}
        pagination={{ active: true, perPage: initialPageSize }}
        onSelectedRowsChange={handleSelectedRowsChange}
        createRecordComponentTitle="Nuevo Cliente"
        createRecordComponent={
          <Modal
            isOpen={createModalOpen}
            onClose={closeAllModals}
            title="Nuevo Cliente"
          >
            <EditCustomerForm
              type="create"
              customer={defaultCustomer}
              onSuccess={handleCreateSuccess}
              onCancel={closeAllModals}
            />
          </Modal>
        }
        setCreateModalOpen={openCreateModal}
        uploadComponent={
          <Modal
            isOpen={uploadModalOpen}
            onClose={handleCloseUploadModal}
            title="Subida Excel de Clientes"
          >
            <UploadDataModal
              bulkUpload={bulkUploadCustomers}
              entityName="Clientes"
              templateUrl="/excel_templates/clientes.xlsx"
              onClose={handleCloseUploadModal}
            />
          </Modal>
        }
        setUploadModalOpen={openUploadModal}
        downloadComponent={
          <Modal
            isOpen={downloadModalOpen}
            onClose={closeAllModals}
            title="Descarga Excel de Clientes"
          >
            <DownloadDataModal
              recordCount={totalRows}
              entityName="Clientes"
              isPending={bulkDownloadCustomers.isPending}
              onConfirm={async () => {
                const allCustomers = (await getCustomersAction()) as Customer[];
                await bulkDownloadCustomers.handleDownload(allCustomers);
                closeAllModals();
              }}
              onClose={closeAllModals}
            />
          </Modal>
        }
        setDownloadModalOpen={openDownloadModal}
        allowedBulkActions={["edit", "delete", "download"]}
        bulkEditComponent={
          <Modal
            isOpen={bulkEditModalOpen}
            onClose={closeAllModals}
            title={`Edición Masiva (${selectedCustomers.length} clientes)`}
          >
            <EditCustomerForm
              type="edit"
              customer={defaultCustomer}
              enabledFields={["tastes", "birthdate"]}
              onBulkSubmit={bulkEditCustomers.handleSubmit}
              bulkRecordCount={selectedCustomers.length}
              isPendingExternal={bulkEditCustomers.isPending}
              onCancel={closeAllModals}
            />
          </Modal>
        }
        setBulkEditModalOpen={openBulkEditModal}
        bulkDeleteComponent={
          <Modal
            isOpen={bulkDeleteModalOpen}
            onClose={closeAllModals}
            title="Eliminación Masiva de Clientes"
          >
            <BulkDeleteModal
              records={selectedCustomers}
              getRecordLabel={(c) => `${c.first_name} ${c.last_name}`}
              entityName="clientes"
              isPending={bulkDeleteCustomers.isPending}
              onConfirm={() =>
                bulkDeleteCustomers.handleDelete(
                  selectedCustomers.map((c) => c.documentId!).filter(Boolean),
                )
              }
              onClose={closeAllModals}
            />
          </Modal>
        }
        setBulkDeleteModalOpen={openBulkDeleteModal}
        bulkDownloadComponent={
          <Modal
            isOpen={bulkDownloadModalOpen}
            onClose={closeAllModals}
            title="Descarga Excel de Clientes Seleccionados"
          >
            <DownloadDataModal
              recordCount={selectedCustomers.length}
              entityName="Clientes Seleccionados"
              isPending={bulkDownloadCustomers.isPending}
              onConfirm={() =>
                bulkDownloadCustomers
                  .handleDownload(selectedCustomers)
                  .then(handleBulkSuccess)
              }
              onClose={closeAllModals}
            />
          </Modal>
        }
        setBulkDownloadModalOpen={openBulkDownloadModal}
        clearSelectedRows={clearSelection}
        keyField="documentId"
        modifiedRowId={modifiedCustomerId}
        serverSide={{
          totalRows,
          loading,
          onPageChange: handlePageChange,
          onPerPageChange: handlePerPageChange,
          onSort: handleSort,
        }}
        onServerSearch={handleSearch}
      />

      {/* Modal para ver cuenta */}
      <Modal
        isOpen={accountModalOpen}
        onClose={closeAllModals}
        title="Detalles de la Cuenta"
      >
        {isLoadingAccount ? (
          <AccountSkeleton />
        ) : account && selectedCustomer ? (
          <AccountTables
            account={account}
            customer={selectedCustomer}
            payments={account.payments}
            products={account.products}
          />
        ) : (
          <AccountError />
        )}
      </Modal>

      {/* Modal para editar cliente */}
      <Modal
        isOpen={editModalOpen}
        onClose={closeAllModals}
        title="Edición Cliente"
      >
        {selectedCustomer && (
          <EditCustomerForm
            type="edit"
            customer={selectedCustomer}
            onSuccess={handleEditSuccess}
            onCancel={closeAllModals}
          />
        )}
      </Modal>

      {/* Modal para eliminar cliente */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={closeAllModals}
        title="Eliminación Cliente"
      >
        {selectedCustomer?.documentId && (
          <DeleteRecordForm
            documentId={selectedCustomer.documentId}
            name={`${selectedCustomer?.first_name || ""} ${selectedCustomer?.last_name || ""}`}
            useDeleteHook={useDeleteCustomer}
            onSuccess={handleDeleteSuccess}
            onCancel={closeAllModals}
          />
        )}
      </Modal>
    </div>
  );
}
