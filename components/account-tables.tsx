'use client';

import { useState } from 'react';
import {
  Account,
  Customer,
  AccountPayment,
  Sale,
  Event,
  ProductDetail,
} from '@/types';
import AccountPaymentsTab from './account/account-payments-tab';
import AccountProductsTab from './account/account-products-tab';
import AccountSalesTab from './account/account-sales-tab';
import AccountEventsTab from './account/account-events-tab';

interface AccountTablesProps {
  account: Account;
  customer: Customer;
  payments?: AccountPayment[];
  products?: ProductDetail[];
  sales?: Sale[];
  events?: Event[];
}

type TabId = 'payments' | 'products' | 'sales' | 'events';

const tabs: { id: TabId; label: string }[] = [
  { id: 'payments', label: 'Pagos' },
  { id: 'products', label: 'Productos' },
  { id: 'sales', label: 'Ventas' },
  { id: 'events', label: 'Eventos' },
];

export default function AccountTables({
  account,
  customer,
  payments = [],
  products = [],
  sales = [],
  events = [],
}: AccountTablesProps) {
  const [activeTab, setActiveTab] = useState<TabId>('payments');

  const customerFullName = `${customer.first_name} ${customer.last_name}`;

  // Colores según el estado de la cuenta
  const getStateColor = (stateName?: string) => {
    switch (stateName?.toUpperCase()) {
      case 'FREE':
        return 'bg-green-100 text-green-800';
      case 'SEPARATE':
        return 'bg-yellow-100 text-yellow-800';
      case 'CREDIT':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="w-full">
      {/* Header: Estado y Cliente */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#fdecf2] flex items-center justify-center">
            <span className="text-[#f37ca8] font-semibold text-lg">
              {customer.first_name[0]}
              {customer.last_name[0]}
            </span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {customerFullName}
            </h3>
            <p className="text-sm text-gray-500">
              Total a pagar: {account.currency} ${account.amount.toString()}
            </p>
          </div>
        </div>
        <span
          className={`px-3 py-1.5 rounded-full text-sm font-medium ${getStateColor(account.state?.name)}`}
        >
          {account.state?.label || 'Sin estado'}
        </span>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-4">
        <nav className="flex gap-1" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#fdecf2] text-[#f37ca8] border-b-2 border-[#f37ca8]'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 cursor-pointer'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[300px]">
        {activeTab === 'payments' && <AccountPaymentsTab payments={payments} />}
        {activeTab === 'products' && <AccountProductsTab products={products} />}
        {activeTab === 'sales' && <AccountSalesTab sales={sales} />}
        {activeTab === 'events' && <AccountEventsTab events={events} />}
      </div>

      {/* Gustos del cliente */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="bg-[#fdecf2] rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-800 mb-1">
            Gustos de {customer.first_name}:
          </h4>
          <p className="text-gray-700">
            {customer.tastes || 'No se han registrado gustos o preferencias.'}
          </p>
        </div>
      </div>
    </div>
  );
}
