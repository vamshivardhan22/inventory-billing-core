import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "../firebase";
import { Order, Invoice, InvoiceItem } from "../types";
import { startOfDay, endOfDay, format } from "date-fns";

export class ReportService {
  static async dailySales() {
    const ordersRef = collection(db, "orders");
    const q = query(ordersRef, orderBy("created_at", "desc"));
    const snapshot = await getDocs(q);
    
    const salesByDate: { [key: string]: number } = {};
    
    snapshot.docs.forEach((doc) => {
      const order = doc.data() as Order;
      const date = format(new Date(order.created_at), "yyyy-MM-dd");
      salesByDate[date] = (salesByDate[date] || 0) + order.total_amount;
    });

    return Object.entries(salesByDate).map(([date, total]) => ({ date, total }));
  }

  static async topProducts() {
    const itemsRef = collection(db, "invoice_items");
    const snapshot = await getDocs(itemsRef);
    
    const productSales: { [key: string]: number } = {};
    
    snapshot.docs.forEach((doc) => {
      const item = doc.data() as InvoiceItem;
      productSales[item.product_id] = (productSales[item.product_id] || 0) + item.qty;
    });

    return Object.entries(productSales)
      .map(([product_id, qty]) => ({ product_id, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 10);
  }

  static async gstReport() {
    const invoicesRef = collection(db, "invoices");
    const snapshot = await getDocs(invoicesRef);
    
    let totalTax = 0;
    snapshot.docs.forEach((doc) => {
      const invoice = doc.data() as Invoice;
      totalTax += invoice.total_tax;
    });

    return totalTax;
  }
}
