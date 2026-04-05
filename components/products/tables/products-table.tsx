"use client";

import { useState, useTransition } from "react";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";
import type { TableColumn } from "react-data-table-component";
import { Product } from "@/types";
import EditIcon from "@/components/icons/edit";
import DeleteIcon from "@/components/icons/delete";
import Table from "@/components/tables/table";
import LinkIcon from "@/components/icons/link";
import { useProductTable } from "@/components/providers/product-table-provider";
import Modal from "@/components/ui/modal";
import CreateRecordTable from "@/components/tables/create-record-table";
import { useGetProductEnums } from "@/hooks/products";
import { useDeleteProduct } from "@/hooks/products";
import {
  getProductStateColor,
  getProductCategoryColor,
  getProductSubcategoryColor,
} from "@/lib/enums-styles";
import {
  toggleRetireProductAction,
  getProductByIdAction,
  getProductsPaginatedAction,
  getProductsAction,
} from "@/actions/products";
import {
  useBulkUploadProducts,
  useBulkDownloadProducts,
  useBulkDeleteProducts,
  useBulkEditProducts,
} from "@/hooks/products";
import { useServerTable } from "@/hooks/tables/useServerTable";

// Lazy load heavy components only needed when modals open (reduce initial JS bundle)
const EditProductForm = dynamic(
  () => import("@/components/products/forms/edit-product-form"),
);
const DeleteRecordForm = dynamic(
  () => import("@/components/tables/delete-record-form"),
);
const ProductDetails = dynamic(
  () => import("@/components/products/details/product-details"),
);
const UploadDataModal = dynamic(
  () => import("@/components/tables/upload-data-modal"),
);
const UploadDataTable = dynamic(
  () => import("@/components/tables/upload-data-table"),
);
const DownloadDataModal = dynamic(
  () => import("@/components/tables/download-data-modal"),
);
import BulkDeleteModal from "@/components/tables/bulk-delete-modal";

const SEARCH_FIELD_MAP: Record<string, string | null> = {
  name: "name",
  price: null,
  state: "state.label",
  category: "category.label",
  subcategory: "subcategory.label",
};

interface ProductsTableProps {
  initialData: Product[];
  initialTotal: number;
  initialPage?: number;
  initialPageSize?: number;
}

export default function ProductsTable({
  initialData,
  initialTotal,
  initialPage = 1,
  initialPageSize = 20,
}: ProductsTableProps) {
  const {
    editModalOpen,
    createModalOpen,
    deleteModalOpen,
    detailsModalOpen,
    uploadModalOpen,
    downloadModalOpen,
    bulkEditModalOpen,
    bulkDeleteModalOpen,
    bulkDownloadModalOpen,
    selectedProduct,
    openEditModal,
    openCreateModal,
    openDeleteModal,
    openDetailsModal,
    openUploadModal,
    openDownloadModal,
    openBulkEditModal,
    openBulkDeleteModal,
    openBulkDownloadModal,
    closeAllModals,
  } = useProductTable();

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
  } = useServerTable<Product>({
    fetchAction: getProductsPaginatedAction,
    initialData,
    initialTotal,
    initialPage,
    initialPageSize,
  });

  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [clearSelection, setClearSelection] = useState(false);
  const [modifiedProductId, setModifiedProductId] = useState<
    string | string[] | null
  >(null);

  const { categories, subcategories } = useGetProductEnums();
  const [isToggling, startToggleTransition] = useTransition();
  const [isLoadingDetails, startDetailsTransition] = useTransition();

  const bulkUploadProducts = useBulkUploadProducts(categories, subcategories);
  const bulkDownloadProducts = useBulkDownloadProducts();
  function handleBulkSuccess() {
    closeAllModals();
    setSelectedProducts([]);
    setClearSelection((prev) => !prev);
    refetch();
  }

  function handleBulkEditSuccess() {
    const ids = selectedProducts.map((p) => p.documentId!).filter(Boolean);
    handleBulkSuccess();
    if (ids.length > 0) {
      setModifiedProductId(null);
      setTimeout(() => {
        setModifiedProductId(ids);
        setTimeout(() => setModifiedProductId(null), 2500);
      }, 0);
    }
  }

  const bulkDeleteProducts = useBulkDeleteProducts({
    onSuccess: handleBulkSuccess,
  });
  const bulkEditProducts = useBulkEditProducts({
    documentIds: selectedProducts.map((p) => p.documentId!).filter(Boolean),
    onSuccess: handleBulkEditSuccess,
  });

  function handleEditSuccess() {
    const id = selectedProduct?.documentId;
    closeAllModals();
    refetch();
    if (id) {
      setModifiedProductId(null);
      setTimeout(() => {
        setModifiedProductId(id);
        setTimeout(() => setModifiedProductId(null), 2500);
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
    bulkUploadProducts.reset();
    refetch();
  }

  function handleSelectedRowsChange(selectedRows: Product[]): void {
    setSelectedProducts(selectedRows);
  }

  function toggleRetireProduct(row: Product): void {
    if (!row.documentId) return;

    startToggleTransition(async () => {
      const result = await toggleRetireProductAction(
        row.documentId!,
        row.state?.name,
        row.stock,
      );

      if (result.success) {
        toast.success(result.message);
        refetch();
      } else {
        toast.error(result.message);
      }
    });
  }

  function handleSearch(query: string, activeColumns: string[]) {
    const strapiFields = activeColumns
      .map((col) => SEARCH_FIELD_MAP[col])
      .filter((f): f is string => f !== null);
    serverHandleSearch(query, strapiFields);
  }

  function getPrecio(row: Product) {
    return `${row.currency} $${new Intl.NumberFormat("es-CO").format(row.price)}`;
  }

  const columns: TableColumn<Product>[] = [
    {
      name: "Nombre",
      minWidth: "160px",
      selector: (row) => row.name.toLowerCase(),
      cell: (row) => <span title={row.name}>{row.name || "Sin nombre"}</span>,
      sortable: true,
      sortField: "name",
    },
    {
      name: "Precio",
      minWidth: "128px",
      center: true,
      selector: (row) => getPrecio(row),
      cell: (row) => (
        <span title={getPrecio(row)}>{getPrecio(row) || "Sin precio"}</span>
      ),
      sortable: true,
      sortField: "price",
    },
    {
      name: "Stock",
      minWidth: "100px",
      center: true,
      selector: (row) => row.stock,
      cell: (row) => <span title={row.stock.toString()}>{row.stock || 0}</span>,
      sortable: true,
      sortField: "stock",
    },
    {
      name: "Categoría",
      minWidth: "160px",
      center: true,
      selector: (row) => row.category?.label || "Sin categoría",
      cell: (row) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-35 inline-block ${getProductCategoryColor(row.category?.name)}`}
          title={row.category?.label || "Sin categoría"}
        >
          {row.category?.label || "Sin categoría"}
        </span>
      ),
      sortable: true,
      sortField: "category.label",
    },
    {
      name: "Subcategoría",
      minWidth: "180px",
      center: true,
      selector: (row) => row.subcategory?.label || "-",
      cell: (row) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-35 inline-block ${getProductSubcategoryColor(row.subcategory?.name)}`}
          title={row.subcategory?.label || "-"}
        >
          {row.subcategory?.label || "-"}
        </span>
      ),
      sortable: true,
      sortField: "subcategory.label",
    },
    {
      name: "Estado",
      minWidth: "140px",
      center: true,
      selector: (row) => row.state?.label || "Sin estado",
      cell: (row) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getProductStateColor(row.state?.name)}`}
        >
          {row.state?.label || "Sin estado"}
        </span>
      ),
      sortable: true,
      sortField: "state.label",
    },
    {
      name: "Activo",
      minWidth: "140px",
      center: true,
      cell: (row) => {
        const isRetired = row.state?.name.toUpperCase() === "RETIRED";
        return (
          <button
            disabled={isToggling}
            onClick={() => toggleRetireProduct(row)}
            aria-label={
              isRetired ? `Activar ${row.name}` : `Desactivar ${row.name}`
            }
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${isRetired ? "bg-gray-300" : "bg-green-500"}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${isRetired ? "translate-x-1" : "translate-x-6"}`}
            />
          </button>
        );
      },
    },
    {
      name: "Detalles",
      button: true,
      minWidth: "140px",
      cell: (row) => (
        <button
          disabled={isToggling || isLoadingDetails}
          aria-label={`Ver detalles de ${row.name}`}
          className="px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-700 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => {
            startDetailsTransition(async () => {
              const product = await getProductByIdAction(row.documentId!);
              openDetailsModal(product ?? row);
            });
          }}
        >
          <LinkIcon />
        </button>
      ),
    },
    {
      name: "Editar",
      button: true,
      minWidth: "140px",
      cell: (row) => (
        <button
          disabled={isToggling}
          aria-label={`Editar ${row.name}`}
          className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-700 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => openEditModal(row)}
        >
          <EditIcon />
        </button>
      ),
    },
    {
      name: "Eliminar",
      button: true,
      minWidth: "140px",
      cell: (row) => (
        <button
          disabled={isToggling}
          aria-label={`Eliminar ${row.name}`}
          className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-700 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => openDeleteModal(row)}
        >
          <DeleteIcon />
        </button>
      ),
    },
  ];

  const filterableColumns = [
    { id: 1, column: "name", name: "Nombre" },
    { id: 2, column: "price", name: "Precio" },
    { id: 3, column: "state", name: "Estado" },
    { id: 4, column: "category", name: "Categoría" },
    { id: 5, column: "subcategory", name: "Subcategoría" },
  ];

  const defaultProduct: Product = {
    id: "",
    documentId: "",
    name: "",
    price: 0,
    currency: "",
    description: "",
    stock: 0,
    category: { id: "", name: "", label: "", description: "" },
    subcategory: { id: "", name: "", label: "", description: "" },
    promos: [],
    state: { id: "", name: "", label: "", description: "" },
    created_at: "",
    updated_at: "",
  };

  if (totalRows === 0 && !loading && !hasActiveSearch) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500 gap-4">
        <p>No hay productos registrados.</p>
        <CreateRecordTable
          renderValue={
            <Modal
              isOpen={createModalOpen}
              onClose={closeAllModals}
              title="Nuevo Producto"
            >
              <EditProductForm
                type="create"
                product={defaultProduct}
                categories={categories}
                subcategories={subcategories}
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
              title="Subida Excel de Productos"
            >
              <UploadDataModal
                bulkUpload={bulkUploadProducts}
                entityName="Productos"
                templateUrl="/excel_templates/productos.xlsx"
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
        createRecordComponentTitle="Nuevo Producto"
        createRecordComponent={
          <Modal
            isOpen={createModalOpen}
            onClose={closeAllModals}
            title="Nuevo Producto"
          >
            <EditProductForm
              type="create"
              product={defaultProduct}
              categories={categories}
              subcategories={subcategories}
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
            title="Subida Excel de Productos"
          >
            <UploadDataModal
              bulkUpload={bulkUploadProducts}
              entityName="Productos"
              templateUrl="/excel_templates/productos.xlsx"
              onClose={handleCloseUploadModal}
            />
          </Modal>
        }
        setUploadModalOpen={openUploadModal}
        downloadComponent={
          <Modal
            isOpen={downloadModalOpen}
            onClose={closeAllModals}
            title="Descarga Excel de Productos"
          >
            <DownloadDataModal
              recordCount={totalRows}
              entityName="Productos"
              isPending={bulkDownloadProducts.isPending}
              onConfirm={async () => {
                const allProducts = (await getProductsAction()) as Product[];
                await bulkDownloadProducts.handleDownload(allProducts);
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
            title={`Edición Masiva (${selectedProducts.length} productos)`}
          >
            <EditProductForm
              type="edit"
              product={defaultProduct}
              categories={categories}
              subcategories={subcategories}
              enabledFields={[
                "price",
                "currency",
                "stock",
                "category",
                "subcategory",
              ]}
              onBulkSubmit={bulkEditProducts.handleSubmit}
              bulkRecordCount={selectedProducts.length}
              isPendingExternal={bulkEditProducts.isPending}
              onCancel={closeAllModals}
            />
          </Modal>
        }
        setBulkEditModalOpen={openBulkEditModal}
        bulkDeleteComponent={
          <Modal
            isOpen={bulkDeleteModalOpen}
            onClose={closeAllModals}
            title="Eliminación Masiva de Productos"
          >
            <BulkDeleteModal
              records={selectedProducts}
              getRecordLabel={(p) => p.name}
              entityName="productos"
              isPending={bulkDeleteProducts.isPending}
              onConfirm={() =>
                bulkDeleteProducts.handleDelete(
                  selectedProducts.map((p) => p.documentId!).filter(Boolean),
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
            title="Descarga Excel de Productos Seleccionados"
          >
            <DownloadDataModal
              recordCount={selectedProducts.length}
              entityName="Productos Seleccionados"
              isPending={bulkDownloadProducts.isPending}
              onConfirm={() =>
                bulkDownloadProducts
                  .handleDownload(selectedProducts)
                  .then(handleBulkSuccess)
              }
              onClose={closeAllModals}
            />
          </Modal>
        }
        setBulkDownloadModalOpen={openBulkDownloadModal}
        clearSelectedRows={clearSelection}
        keyField="documentId"
        modifiedRowId={modifiedProductId}
        serverSide={{
          totalRows,
          loading,
          onPageChange: handlePageChange,
          onPerPageChange: handlePerPageChange,
          onSort: handleSort,
        }}
        onServerSearch={handleSearch}
      />

      {/** Modal para ver detalles del producto */}
      <Modal
        isOpen={detailsModalOpen}
        onClose={closeAllModals}
        title="Detalles del Producto"
      >
        <ProductDetails product={selectedProduct} />
      </Modal>

      {/** Modal para editar producto */}
      <Modal
        isOpen={editModalOpen}
        onClose={closeAllModals}
        title="Edición Producto"
      >
        {selectedProduct && (
          <EditProductForm
            type="edit"
            product={selectedProduct}
            categories={categories}
            subcategories={subcategories}
            onSuccess={handleEditSuccess}
            onCancel={closeAllModals}
          />
        )}
      </Modal>

      {/** Modal para eliminar producto */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={closeAllModals}
        title="Eliminación Producto"
      >
        {selectedProduct?.documentId && (
          <DeleteRecordForm
            documentId={selectedProduct.documentId}
            name={selectedProduct.name}
            useDeleteHook={useDeleteProduct}
            onSuccess={handleDeleteSuccess}
            onCancel={closeAllModals}
          />
        )}
      </Modal>
    </div>
  );
}
