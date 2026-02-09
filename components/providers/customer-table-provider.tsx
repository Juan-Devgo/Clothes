'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { Customer } from '@/types/domain/types';

interface CustomerTableContextType {
  // Estado de modales
  editModalOpen: boolean;
  createModalOpen: boolean;
  deleteModalOpen: boolean;
  accountModalOpen: boolean;

  // Cliente seleccionado
  selectedCustomer: Customer | null;
  selectedAccountId: string | null;

  // Funciones para abrir/cerrar modales
  openEditModal: (customer: Customer) => void;
  openDeleteModal: (customer: Customer) => void;
  openAccountModal: (customer: Customer, accountId: string) => void;
  openCreateModal: () => void;
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

  function closeAllModals() {
    setEditModalOpen(false);
    setCreateModalOpen(false);
    setDeleteModalOpen(false);
    setAccountModalOpen(false);
    setSelectedCustomer(null);
    setSelectedAccountId(null);
  }

  const value: CustomerTableContextType = {
    editModalOpen,
    createModalOpen,
    deleteModalOpen,
    accountModalOpen,
    selectedCustomer,
    selectedAccountId,
    openEditModal,
    openDeleteModal,
    openAccountModal,
    openCreateModal,
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
