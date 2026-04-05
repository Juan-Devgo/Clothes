import { getCustomersPaginatedAction } from "@/actions/customers";
import CustomersTable from "@/components/customers/tables/customers-table";
import PersonIcon from "@/components/icons/person";
import { CustomerTableProvider } from "@/components/providers/customer-table-provider";

export default async function Customers() {
  const result = await getCustomersPaginatedAction({ page: 1, pageSize: 20 });

  return (
    <section className="flex flex-col flex-1 min-h-0">
      <div className="ml-2 sm:ml-4 my-4 sm:my-6 md:my-8 flex gap-2 items-center">
        <PersonIcon className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
        <h2 className="text-xl sm:text-2xl md:text-3xl text-left font-bold">
          Registros de Clientes
        </h2>
      </div>
      <CustomerTableProvider>
        <CustomersTable
          initialData={result.data}
          initialTotal={result.total}
          initialPage={result.page}
          initialPageSize={result.pageSize}
        />
      </CustomerTableProvider>
    </section>
  );
}
