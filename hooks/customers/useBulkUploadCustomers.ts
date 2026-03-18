'use client';

import { useBulkUpload } from '@/hooks/bulk';
import {
  createCustomersBulkAction,
  deleteAllCustomersAction,
} from '@/actions/customers';
import {
  CustomerExcelRowSchema,
  CustomerExcelRow,
} from '@/types/customer/excel-schemas';
import { parseSpreadsheetFile, type ExcelParseConfig } from '@/service/excel';
import { BulkUploadEntityConfig } from '@/types/shared/bulk';

/**
 * Configuración de parseo Excel para Clientes.
 * Mapea los nombres de columna de la plantilla a las claves del schema Zod.
 *
 * Plantilla:
 *   B2: "Cliente"
 *   C2: Nombre → first_name
 *   D2: Apellido → last_name
 *   E2: Teléfono → phone
 *   F2: Fecha de Nacimiento → birthdate
 *   G2: Correo → email
 *   H2: Gustos → tastes
 */
const customerExcelConfig: ExcelParseConfig = {
  columnMapping: {
    Nombre: 'first_name',
    Apellido: 'last_name',
    Teléfono: 'phone',
    'Fecha de Nacimiento': 'birthdate',
    Correo: 'email',
    Gustos: 'tastes',
  },
  fieldTransformers: {
    phone: (v) => (v !== undefined && v !== null ? String(v) : undefined),
    birthdate: (v) => {
      if (!v) return undefined;
      if (v instanceof Date) return v.toISOString().split('T')[0];
      return String(v);
    },
  },
};

const customerBulkConfig: BulkUploadEntityConfig<CustomerExcelRow> = {
  entityName: 'Cliente',
  columnLabels: Object.fromEntries(
    Object.entries(customerExcelConfig.columnMapping).map(([k, v]) => [v, k]),
  ),
  rowSchema: CustomerExcelRowSchema,
  bulkCreateAction: createCustomersBulkAction,
  deleteAllAction: deleteAllCustomersAction,
  parseExcelFile: (file) => parseSpreadsheetFile(file, customerExcelConfig),
};

export function useBulkUploadCustomers() {
  return useBulkUpload<CustomerExcelRow>(customerBulkConfig);
}
