export interface Customer {
  id: string;
  documentId?: string;
  first_name: string;
  last_name: string;
  phone: string;
  email?: string;
  tastes?: string;
  account?: Account | string;
  sales?: Sale[];
  events?: Event[];
  birthdate?: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}

export interface Account {
  id: string;
  documentId?: string;
  amount: number;
  currency: string;
  customer: Customer | string;
  payments?: AccountPayment[];
  state: AccountState;
  products?: ProductDetail[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AccountPayment {
  id: string;
  documentId?: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  account_id: string;
  created_at: string;
  updated_at: string;
}

export interface AccountState {
  id: string;
  documentId?: string;
  name: string;
  label: string;
  description: string;
}

export interface Product {
  id: string;
  documentId?: string;
  name: string;
  price: number;
  currency: string;
  description: string;
  stock: number;
  photo_url?: string;
  category: ProductCategory;
  subcategory: ProductSubcategory;
  promos: Promo[];
  state: ProductState;
  created_at: string;
  updated_at: string;
}

export interface ProductDetail {
  id: string;
  documentId?: string;
  product?: Product | string;
  quantity: number;
  state: ProductDetailState;
  sale?: Sale | string;
  account?: Account | string;
  created_at: string;
  updated_at: string;
}

export interface ProductDetailState {
  id: string;
  name: string;
  label: string;
  description: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  label: string;
  description: string;
}

export interface ProductSubcategory {
  id: string;
  name: string;
  label: string;
  description: string;
}

export interface ProductState {
  id: string;
  name: string;
  label: string;
  description: string;
}

export interface Sale {
  id: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  description: string;
  customer_id: string;
  state: SaleState;
  products_details: ProductDetail[];
  created_at: string;
  updated_at: string;
}

export interface SaleState {
  id: string;
  name: string;
  label: string;
  description: string;
}

export interface PaymentMethod {
  id: string;
  type: string;
}

export interface Promo {
  id: string;
  name: string;
  description: string;
  discount: PromoDiscount;
  valid_from: string;
  valid_to: string;
}

export interface PromoDiscount {
  id: string;
  type: 'percentage' | 'fixed';
  value: number;
}

export interface Event {
  id: string;
  name: string;
  description: string;
  valid_from: string;
  valid_to: string;
  customers: Customer[];
  products: Product[];
  created_at: string;
  updated_at: string;
}
