"use client";

import { useState } from "react";
import DeleteIcon from "@/components/icons/delete";
import EditIcon from "@/components/icons/edit";
import LinkIcon from "@/components/icons/link";
import Table from "@/components/tables/table";
import Modal from "@/components/ui/modal";
import { Customer } from "@/types";
import { useCustomerTable } from "@/components/providers/customer-table-provider";
import { useDeleteCustomer } from "@/hooks/customers";
import AccountTables from "@/components/customers/account/account-tables";
import { useGetAccount } from "@/hooks/accounts";
import AccountSkeleton from "@/components/customers/account/account-skeleton";
import AccountError from "@/components/customers/account/account-error";
import DeleteRecordForm from "@/components/tables/delete-record-form";
import EditCustomerForm from "@/components/customers/forms/edit-customer-form";
import CreateRecordTable from "@/components/tables/create-record-table";
import UploadDataModal from "@/components/tables/upload-data-modal";
import DownloadDataModal from "@/components/tables/download-data-modal";
import BulkDeleteModal from "@/components/tables/bulk-delete-modal";
import {
  useBulkUploadCustomers,
  useBulkDownloadCustomers,
  useBulkDeleteCustomers,
  useBulkEditCustomers,
} from "@/hooks/customers";
import UploadDataTable from "@/components/tables/upload-data-table";

export default function CustomersTable({ data }: { data: Customer[] }) {
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

  const [selectedCustomers, setSelectedCustomers] = useState<Customer[]>([]);
  const [clearSelection, setClearSelection] = useState(false);

  const { account, isLoading: isLoadingAccount } = useGetAccount(
    accountModalOpen ? selectedAccountId : null,
  );

  const bulkUploadCustomers = useBulkUploadCustomers();
  const bulkDownloadCustomers = useBulkDownloadCustomers();
  function handleBulkSuccess() {
    closeAllModals();
    setSelectedCustomers([]);
    setClearSelection((prev) => !prev);
  }

  const bulkDeleteCustomers = useBulkDeleteCustomers({ onSuccess: handleBulkSuccess });
  const bulkEditCustomers = useBulkEditCustomers({
    documentIds: selectedCustomers.map((c) => c.documentId!).filter(Boolean),
    onSuccess: handleBulkSuccess,
  });

  function handleCloseUploadModal() {
    closeAllModals();
    bulkUploadCustomers.reset();
  }

  function handleSelectedRowsChange(selectedRows: Customer[]) {
    setSelectedCustomers(selectedRows);
  }

  const columns = [
    {
      name: "Nombre",
      selector: (row: Customer) => row.first_name,
      sortable: true,
    },
    {
      name: "Apellido",
      selector: (row: Customer) => row.last_name,
      sortable: true,
    },
    {
      name: "Teléfono",
      selector: (row: Customer) => row.phone,
    },
    {
      name: "Email",
      selector: (row: Customer) => row.email || "-",
    },
    {
      name: "Cumpleaños",
      selector: (row: Customer) => {
        if (!row.birthdate) return "No proporcionado";
        const date = new Date(row.birthdate + "T00:00:00");
        return date.toLocaleDateString("es-ES", {
          day: "numeric",
          month: "long",
        });
      },
      sortable: true,
    },
    {
      name: <span className="block w-full text-center">Cuenta</span>,
      width: "150px",
      cell: (row: Customer & { account?: { documentId: string } }) => {
        if (!row.account || !row.account.documentId) {
          return <div className="w-full text-center">No asignada</div>;
        }
        return (
          <div className="w-full flex justify-center">
            <button
              className="px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-700 cursor-pointer transition-colors"
              onClick={() => openAccountModal(row, row.account!.documentId)}
            >
              <LinkIcon />
            </button>
          </div>
        );
      },
    },
    {
      name: <span className="block w-full text-center">Editar</span>,
      width: "150px",
      cell: (row: Customer) => (
        <div className="w-full flex justify-center">
          <button
            className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-700 cursor-pointer transition-colors"
            onClick={() => openEditModal(row)}
          >
            <EditIcon />
          </button>
        </div>
      ),
    },
    {
      name: <span className="block w-full text-center">Eliminar</span>,
      width: "150px",
      cell: (row: Customer) => (
        <div className="w-full flex justify-center">
          <button
            className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-700 cursor-pointer transition-colors"
            onClick={() => openDeleteModal(row)}
          >
            <DeleteIcon />
          </button>
        </div>
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

  if (data.length === 0) {
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
                onSuccess={closeAllModals}
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
    <>
      <Table
        title="Registros de Clientes"
        columns={columns}
        filterableColumns={filterableColumns}
        data={data}
        selectableRows={true}
        pagination={{ active: true, perPage: 10 }}
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
              onSuccess={closeAllModals}
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
              recordCount={data.length}
              entityName="Clientes"
              isPending={bulkDownloadCustomers.isPending}
              onConfirm={() =>
                bulkDownloadCustomers.handleDownload(data).then(closeAllModals)
              }
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
        pendingText="Cargando Clientes..."
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
            onSuccess={closeAllModals}
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
            onSuccess={closeAllModals}
            onCancel={closeAllModals}
          />
        )}
      </Modal>
    </>
  );
}
