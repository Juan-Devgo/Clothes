import type { TableColumn } from "react-data-table-component";

export type Column<T = unknown> = TableColumn<T>;

export interface SortableColumn {
  sortField?: string;
}

export interface Filter {
  id: number;
  column: string;
  name: string;
}
