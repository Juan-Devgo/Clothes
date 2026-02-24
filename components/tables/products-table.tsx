'use client';

import { useTransition } from 'react';
import toast from 'react-hot-toast';
import { Product } from '@/types';
import EditIcon from '../icons/edit';
import DeleteIcon from '../icons/delete';
import Table from './table';
import LinkIcon from '../icons/link';
import { useProductTable } from '../providers/product-table-provider';
import Modal from '../ui/modal';
import EditProductForm from '../products-forms/edit-product-form';
import CreateRecordTable from './create-record-table';
import { useGetProductEnums } from '@/hooks/products';
import { useDeleteProduct } from '@/hooks/products';
import DeleteRecordForm from './delete-record-form';
import ProductDetails from '../product-details/product-details';
import {
  getProductStateColor,
  getProductCategoryColor,
  getProductSubcategoryColor,
} from '@/lib/enums-styles';
import { toggleRetireProductAction } from '@/actions/products';
import RemoveIcon from '../icons/remove';
import AddIcon from '../icons/add';

export default function ProductsTable({ data }: { data: Product[] }) {
  const {
    editModalOpen,
    createModalOpen,
    deleteModalOpen,
    detailsModalOpen,
    selectedProduct,
    openEditModal,
    openCreateModal,
    openDeleteModal,
    openDetailsModal,
    closeAllModals,
  } = useProductTable();

  const { categories, subcategories } = useGetProductEnums();
  const [isToggling, startToggleTransition] = useTransition();

  function handleSelectedRowsChange(selectedRows: unknown[]): void {
    console.log('Selected rows:', selectedRows);
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
      name: 'Nombre',
      selector: (row: Product) => row.name,
      sortable: true,
    },
    {
      name: 'Precio',
      selector: (row: Product) =>
        `${row.currency} $${new Intl.NumberFormat('es-CO').format(row.price)}`,
      sortable: true,
    },
    {
      name: 'Stock',
      selector: (row: Product) => row.stock,
      sortable: true,
    },
    // El estilo pl-5 se agrega para compensar el badge para ordenar (atributo sortable: true abajo) y centrar estas tres columnas
    {
      name: <span className="block w-full text-center pl-5">Estado</span>,
      selector: (row: Product) => row.state?.label || 'Sin estado',
      cell: (row: Product) => (
        <div className="w-full flex justify-center">
          <span
            className={`px-3 py-1.5 rounded-full text-sm font-medium ${getProductStateColor(row.state?.name)}`}
          >
            {row.state?.label || 'Sin estado'}
          </span>
        </div>
      ),
      sortable: true,
    },
    {
      name: <span className="block w-full text-center pl-5">Categoría</span>,
      selector: (row: Product) => row.category?.label || 'Sin categoría',
      cell: (row: Product) => (
        <div className="w-full flex justify-center">
          <span
            className={`px-3 py-1.5 rounded-full text-sm font-medium ${getProductCategoryColor(row.category?.name)}`}
          >
            {row.category?.label || 'Sin categoría'}
          </span>
        </div>
      ),
      sortable: true,
    },
    {
      name: <span className="block w-full text-center pl-5">Subcategoría</span>,
      selector: (row: Product) => row.subcategory?.label || 'Sin subcategoría',
      cell: (row: Product) => (
        <div className="w-full flex justify-center">
          <span
            className={`px-3 py-1.5 rounded-full text-sm font-medium ${getProductSubcategoryColor(row.subcategory?.name)}`}
          >
            {row.subcategory?.label || 'Sin subcategoría'}
          </span>
        </div>
      ),
      sortable: true,
    },
    {
      name: <span className="block w-full text-center">Detalles</span>,
      width: '150px',
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
      width: '150px',
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
      name: (
        <span className="block w-full text-center">Retirar / Reactivar</span>
      ),
      width: '150px',
      cell: (row: Product) => {
        const isRetired = row.state?.name.toUpperCase() === 'RETIRED';
        return (
          <div className="w-full flex justify-center">
            <button
              disabled={isToggling}
              className={`px-2 py-1 text-white rounded cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isRetired ? 'bg-green-500 hover:bg-green-700' : 'bg-yellow-500 hover:bg-yellow-700'}`}
              onClick={() => toggleRetireProduct(row)}
            >
              {isRetired ? <AddIcon /> : <RemoveIcon />}
            </button>
          </div>
        );
      },
    },
    {
      name: <span className="block w-full text-center">Eliminar</span>,
      width: '150px',
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
    { id: 1, column: 'name', name: 'Nombre' },
    { id: 2, column: 'price', name: 'Precio' },
    { id: 3, column: 'state', name: 'Estado' },
    { id: 4, column: 'category', name: 'Categoría' },
    { id: 5, column: 'subcategory', name: 'Subcategoría' },
  ];

  const defaultProduct: Product = {
    id: '',
    documentId: '',
    name: '',
    price: 0,
    currency: '',
    description: '',
    stock: 0,
    category: { id: '', name: '', label: '', description: '' },
    subcategory: { id: '', name: '', label: '', description: '' },
    promos: [],
    state: { id: '', name: '', label: '', description: '' },
    created_at: '',
    updated_at: '',
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
