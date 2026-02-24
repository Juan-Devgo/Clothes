import { getCustomersAction } from '@/actions/customers';
import CustomersTable from '@/components/tables/customers-table';
import { CustomerTableProvider } from '@/components/providers/customer-table-provider';
import { Customer } from '@/types/domain/types';

export default async function Customers() {
  const data = (await getCustomersAction()) as Customer[];
  return (
    <>
      <section>
        <CustomerTableProvider>
          <CustomersTable data={data} />
        </CustomerTableProvider>
      </section>
    </>
  );
}
