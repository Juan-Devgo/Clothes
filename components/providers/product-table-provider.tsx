'use client';

import { Product } from '@/types';
import { createContext, ReactNode, useContext, useState } from 'react';

interface ProductTableContextType {
  // Estado de modales
  editModalOpen: boolean;
  createModalOpen: boolean;
  deleteModalOpen: boolean;
  detailsModalOpen: boolean;
  uploadModalOpen: boolean;
  downloadModalOpen: boolean;
  bulkEditModalOpen: boolean;
  bulkDeleteModalOpen: boolean;
  bulkDownloadModalOpen: boolean;

  // Producto seleccionado
  selectedProduct: Product | null;

  // Funciones para abrir/cerrar modales
  openEditModal: (product: Product) => void;
  openDeleteModal: (product: Product) => void;
  openDetailsModal: (product: Product) => void;
  openCreateModal: () => void;
  openUploadModal: () => void;
  openDownloadModal: () => void;
  openBulkEditModal: () => void;
  openBulkDeleteModal: () => void;
  openBulkDownloadModal: () => void;
  closeAllModals: () => void;
}

const ProductTableContext = createContext<ProductTableContextType | undefined>(
  undefined,
);

export function ProductTableProvider({ children }: { children: ReactNode }) {
  // Estados de modales
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [bulkEditModalOpen, setBulkEditModalOpen] = useState(false);
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [bulkDownloadModalOpen, setBulkDownloadModalOpen] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  function openEditModal(product: Product) {
    setSelectedProduct(product);
    setEditModalOpen(true);
  }

  function openDeleteModal(product: Product) {
    setSelectedProduct(product);
    setDeleteModalOpen(true);
  }

  function openDetailsModal(product: Product) {
    setSelectedProduct(product);
    setDetailsModalOpen(true);
  }

  function openCreateModal() {
    setSelectedProduct(null);
    setCreateModalOpen(true);
  }

  function openUploadModal() {
    setUploadModalOpen(true);
  }

  function openDownloadModal() {
    setDownloadModalOpen(true);
  }

  function openBulkEditModal() {
    setBulkEditModalOpen(true);
  }

  function openBulkDeleteModal() {
    setBulkDeleteModalOpen(true);
  }

  function openBulkDownloadModal() {
    setBulkDownloadModalOpen(true);
  }

  function closeAllModals() {
    setEditModalOpen(false);
    setCreateModalOpen(false);
    setDeleteModalOpen(false);
    setDetailsModalOpen(false);
    setUploadModalOpen(false);
    setDownloadModalOpen(false);
    setBulkEditModalOpen(false);
    setBulkDeleteModalOpen(false);
    setBulkDownloadModalOpen(false);
    setSelectedProduct(null);
  }

  const value: ProductTableContextType = {
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
    openDeleteModal,
    openDetailsModal,
    openCreateModal,
    openUploadModal,
    openDownloadModal,
    openBulkEditModal,
    openBulkDeleteModal,
    openBulkDownloadModal,
    closeAllModals,
  };

  return (
    <ProductTableContext.Provider value={value}>
      {children}
    </ProductTableContext.Provider>
  );
}

export function useProductTable() {
  const context = useContext(ProductTableContext);
  if (context === undefined) {
    throw new Error(
      'useProductTable must be used within a ProductTableProvider',
    );
  }
  return context;
}
