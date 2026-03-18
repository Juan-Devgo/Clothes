'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { Customer } from '@/types';

interface CustomerTableContextType {
  // Estado de modales
  editModalOpen: boolean;
  createModalOpen: boolean;
  deleteModalOpen: boolean;
  accountModalOpen: boolean;
  uploadModalOpen: boolean;
  downloadModalOpen: boolean;
  bulkEditModalOpen: boolean;
  bulkDeleteModalOpen: boolean;
  bulkDownloadModalOpen: boolean;

  // Cliente seleccionado
  selectedCustomer: Customer | null;
  selectedAccountId: string | null;

  // Funciones para abrir/cerrar modales
  openEditModal: (customer: Customer) => void;
  openDeleteModal: (customer: Customer) => void;
  openAccountModal: (customer: Customer, accountId: string) => void;
  openCreateModal: () => void;
  openUploadModal: () => void;
  openDownloadModal: () => void;
  openBulkEditModal: () => void;
  openBulkDeleteModal: () => void;
  openBulkDownloadModal: () => void;
  closeAllModals: () => void;
}

const CustomerTableContext = createContext<
  CustomerTableContextType | undefined
>(undefined);

export function CustomerTableProvider({ children }: { children: ReactNode }) {
  // Estados de modales
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [bulkEditModalOpen, setBulkEditModalOpen] = useState(false);
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [bulkDownloadModalOpen, setBulkDownloadModalOpen] = useState(false);

  // Cliente seleccionado
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    null,
  );

  // Funciones para abrir modales
  function openEditModal(customer: Customer) {
    setSelectedCustomer(customer);
    setEditModalOpen(true);
  }

  function openDeleteModal(customer: Customer) {
    setSelectedCustomer(customer);
    setDeleteModalOpen(true);
  }

  function openAccountModal(customer: Customer, accountId: string) {
    setSelectedCustomer(customer);
    setSelectedAccountId(accountId);
    setAccountModalOpen(true);
  }

  function openCreateModal() {
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
    setAccountModalOpen(false);
    setUploadModalOpen(false);
    setDownloadModalOpen(false);
    setBulkEditModalOpen(false);
    setBulkDeleteModalOpen(false);
    setBulkDownloadModalOpen(false);
    setSelectedCustomer(null);
    setSelectedAccountId(null);
  }

  const value: CustomerTableContextType = {
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
    openDeleteModal,
    openAccountModal,
    openCreateModal,
    openUploadModal,
    openDownloadModal,
    openBulkEditModal,
    openBulkDeleteModal,
    openBulkDownloadModal,
    closeAllModals,
  };

  return (
    <CustomerTableContext.Provider value={value}>
      {children}
    </CustomerTableContext.Provider>
  );
}

export function useCustomerTable() {
  const context = useContext(CustomerTableContext);
  if (context === undefined) {
    throw new Error(
      'useCustomerTable must be used within a CustomerTableProvider',
    );
  }
  return context;
}
