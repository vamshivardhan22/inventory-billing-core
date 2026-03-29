export interface Product {
  id: string;
  name: string;
  price: number;
  gst_rate: number;
  hsn_code: string;
}

export interface Inventory {
  product_id: string;
  quantity: number;
  last_updated: string;
}

export interface Order {
  id: string;
  total_amount: number;
  created_at: string;
  uid: string;
}

export interface Invoice {
  id: string;
  order_id: string;
  invoice_number: string;
  total_base: number;
  total_tax: number;
  grand_total: number;
  created_at: string;
  uid: string;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  product_id: string;
  qty: number;
  price: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
}

export interface GSTCalculation {
  base: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
}
