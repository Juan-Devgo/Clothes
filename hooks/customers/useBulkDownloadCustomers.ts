'use client';

import { useBulkDownload } from '@/hooks/bulk';
import { BulkDownloadEntityConfig } from '@/types/shared/bulk';
import { Customer } from '@/types';

const customerDownloadConfig: BulkDownloadEntityConfig<Customer> = {
  entityName: 'clientes',
  templateUrl: '/excel_templates/clientes.xlsx',
  columnMapping: {
    Nombre: 'first_name',
    Apellido: 'last_name',
    Teléfono: 'phone',
    'Fecha de Nacimiento': 'birthdate',
    Correo: 'email',
    Gustos: 'tastes',
  },
  rowMapper: (customer) => ({
    first_name: customer.first_name,
    last_name: customer.last_name,
    phone: customer.phone,
    birthdate: customer.birthdate ?? null,
    email: customer.email ?? null,
    tastes: customer.tastes ?? null,
  }),
};

export function useBulkDownloadCustomers() {
  return useBulkDownload<Customer>(customerDownloadConfig);
}
