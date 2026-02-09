export interface Column {
  name: string;
  selector?: (row: any) => any;
  cell?: (row: any) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

export interface Filter {
  id: number;
  column: string;
  name: string;
}
