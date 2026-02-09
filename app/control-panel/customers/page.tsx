import { getCustomersAction } from '@/actions/customers';
import CustomersTable from '@/components/customers-table';
import { CustomerTableProvider } from '@/components/providers/customer-table-provider';
import { Customer } from '@/types/domain/types';
import { Suspense } from 'react';

export default async function Customers() {
  const data = (await getCustomersAction()) as Customer[];
  return (
    <>
      <section>
        <Suspense fallback={<div>Cargando clientes...</div>}>
          <CustomerTableProvider>
            <CustomersTable data={data} />
          </CustomerTableProvider>
        </Suspense>
      </section>
    </>
  );
}
