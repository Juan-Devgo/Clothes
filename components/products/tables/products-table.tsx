"use client";

import { useState, useTransition } from "react";
import toast from "react-hot-toast";
import { Product } from "@/types";
import EditIcon from "@/components/icons/edit";
import DeleteIcon from "@/components/icons/delete";
import Table from "@/components/tables/table";
import LinkIcon from "@/components/icons/link";
import { useProductTable } from "@/components/providers/product-table-provider";
import Modal from "@/components/ui/modal";
import EditProductForm from "@/components/products/forms/edit-product-form";
import CreateRecordTable from "@/components/tables/create-record-table";
import { useGetProductEnums } from "@/hooks/products";
import { useDeleteProduct } from "@/hooks/products";
import DeleteRecordForm from "@/components/tables/delete-record-form";
import ProductDetails from "@/components/products/details/product-details";
import {
  getProductStateColor,
  getProductCategoryColor,
  getProductSubcategoryColor,
} from "@/lib/enums-styles";
import { toggleRetireProductAction } from "@/actions/products";
import UploadDataModal from "@/components/tables/upload-data-modal";
import DownloadDataModal from "@/components/tables/download-data-modal";
import BulkDeleteModal from "@/components/tables/bulk-delete-modal";
import {
  useBulkUploadProducts,
  useBulkDownloadProducts,
  useBulkDeleteProducts,
  useBulkEditProducts,
} from "@/hooks/products";

export default function ProductsTable({ data }: { data: Product[] }) {
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

  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [clearSelection, setClearSelection] = useState(false);

  const { categories, subcategories } = useGetProductEnums();
  const [isToggling, startToggleTransition] = useTransition();

  const bulkUploadProducts = useBulkUploadProducts();
  const bulkDownloadProducts = useBulkDownloadProducts();
  function handleBulkSuccess() {
    closeAllModals();
    setSelectedProducts([]);
    setClearSelection((prev) => !prev);
  }

  const bulkDeleteProducts = useBulkDeleteProducts({ onSuccess: handleBulkSuccess });
  const bulkEditProducts = useBulkEditProducts({
    documentIds: selectedProducts.map((p) => p.documentId!).filter(Boolean),
    onSuccess: handleBulkSuccess,
  });

  function handleCloseUploadModal() {
    closeAllModals();
    bulkUploadProducts.reset();
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
      } else {
        toast.error(result.message);
      }
    });
  }

  const columns = [
    {
      name: "Nombre",
      selector: (row: Product) => row.name.toLowerCase(),
      cell: (row: Product) => (
        <span className="">{row.name || "Sin nombre"}</span>
      ),
      sortable: true,
    },
    {
      name: "Precio",
      selector: (row: Product) =>
        `${row.currency} $${new Intl.NumberFormat("es-CO").format(row.price)}`,
      sortable: true,
    },
    {
      name: "Stock",
      selector: (row: Product) => row.stock,
      sortable: true,
    },
    {
      name: <span className="block w-full text-center pl-5">Categoría</span>,
      selector: (row: Product) => row.category?.label || "Sin categoría",
      cell: (row: Product) => (
        <div className="w-full flex justify-center">
          <span
            className={`px-3 py-1.5 rounded-full text-sm font-medium ${getProductCategoryColor(row.category?.name)}`}
          >
            {row.category?.label || "Sin categoría"}
          </span>
        </div>
      ),
      sortable: true,
    },
    {
      name: <span className="block w-full text-center pl-5">Subcategoría</span>,
      selector: (row: Product) => row.subcategory?.label || "Sin subcategoría",
      cell: (row: Product) => (
        <div className="w-full flex justify-center">
          <span
            className={`px-3 py-1.5 rounded-full text-sm font-medium ${getProductSubcategoryColor(row.subcategory?.name)}`}
          >
            {row.subcategory?.label || "Sin subcategoría"}
          </span>
        </div>
      ),
      sortable: true,
    },
    {
      name: <span className="block w-full text-center pl-5">Estado</span>,
      selector: (row: Product) => row.state?.label || "Sin estado",
      cell: (row: Product) => (
        <div className="w-full flex justify-center">
          <span
            className={`px-3 py-1.5 rounded-full text-sm font-medium ${getProductStateColor(row.state?.name)}`}
          >
            {row.state?.label || "Sin estado"}
          </span>
        </div>
      ),
      sortable: true,
    },
    {
      name: <span className="block w-full text-center">Activo</span>,
      width: "120px",
      cell: (row: Product) => {
        const isRetired = row.state?.name.toUpperCase() === "RETIRED";
        return (
          <div className="w-full flex justify-center">
            <button
              disabled={isToggling}
              onClick={() => toggleRetireProduct(row)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${isRetired ? "bg-gray-300" : "bg-green-500"}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${isRetired ? "translate-x-1" : "translate-x-6"}`}
              />
            </button>
          </div>
        );
      },
    },
    {
      name: <span className="block w-full text-center">Detalles</span>,
      width: "150px",
      cell: (row: Product) => {
        return (
          <div className="w-full flex justify-center">
            <button
              disabled={isToggling}
              className="px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-700 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:cursor:not-allowed"
              onClick={() => openDetailsModal(row)}
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
      cell: (row: Product) => (
        <div className="w-full flex justify-center">
          <button
            disabled={isToggling}
            className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-700 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:cursor:not-allowed"
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
      cell: (row: Product) => (
        <div className="w-full flex justify-center">
          <button
            disabled={isToggling}
            className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-700 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:cursor:not-allowed"
            onClick={() => openDeleteModal(row)}
          >
            <DeleteIcon />
          </button>
        </div>
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

  if (data.length === 0) {
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
                onSuccess={closeAllModals}
                onCancel={closeAllModals}
              />
            </Modal>
          }
          setCreateModalOpen={openCreateModal}
        />
        <CreateRecordTable
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
          setCreateModalOpen={openCreateModal}
        />
      </div>
    );
  }

  return (
    <>
      <Table
        title="Registros de Productos"
        columns={columns}
        filterableColumns={filterableColumns}
        data={data}
        selectableRows={true}
        pagination={{ active: true, perPage: 10 }}
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
              recordCount={data.length}
              entityName="Productos"
              isPending={bulkDownloadProducts.isPending}
              onConfirm={() =>
                bulkDownloadProducts.handleDownload(data).then(closeAllModals)
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
            title={`Edición Masiva (${selectedProducts.length} productos)`}
          >
            <EditProductForm
              type="edit"
              product={defaultProduct}
              categories={categories}
              subcategories={subcategories}
              enabledFields={["price", "currency", "stock", "category", "subcategory"]}
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
      />

      {/** Modal para ver detalles del producto */}
      <Modal
        isOpen={detailsModalOpen}
        onClose={closeAllModals}
        title="Detalles del Producto"
      >
        {/* {!selectedProduct?.photo ? (
          <ProductDetailsSkeleton />
        ) : selectedProduct ? ( */}

        <ProductDetails product={selectedProduct} />

        {/* ) : (
          <p className="text-center text-gray-500">
            No se pudo cargar el producto
          </p>
        )} */}
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
            onSuccess={closeAllModals}
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
            onSuccess={closeAllModals}
            onCancel={closeAllModals}
          />
        )}
      </Modal>
    </>
  );
}
