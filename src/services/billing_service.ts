import {
  collection,
  doc,
  getDoc,
  runTransaction,
  setDoc,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { StockEngine } from "./stock_engine";
import { calculateGST } from "./gst_engine";
import { Order, Invoice, InvoiceItem } from "../types";

export class BillingService {
  static async createOrder(
    idempotencyKey: string,
    items: { product_id: string; quantity: number }[]
  ) {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    // Idempotency check
    const existingIdempotency = await getDoc(doc(db, "idempotency", idempotencyKey));
    if (existingIdempotency.exists()) {
      return existingIdempotency.data().response;
    }

    try {
      const result = await runTransaction(db, async (transaction) => {
        const { snapshots, products } = await StockEngine.reserve(transaction, items);

        const orderRef = doc(collection(db, "orders"));
        const invoiceRef = doc(collection(db, "invoices"));

        let total = 0;
        let totalTax = 0;
        const invoiceItems: InvoiceItem[] = [];

        for (const item of items) {
          const product = products[item.product_id];
          const gst = calculateGST(product.price, item.quantity, product.gst_rate);

          total += gst.total;
          totalTax += gst.cgst + gst.sgst + gst.igst;

          const invoiceItemRef = doc(collection(db, "invoice_items"));
          const invoiceItem: InvoiceItem = {
            id: invoiceItemRef.id,
            invoice_id: invoiceRef.id,
            product_id: product.id,
            qty: item.quantity,
            price: product.price,
            cgst: gst.cgst,
            sgst: gst.sgst,
            igst: gst.igst,
            total: gst.total,
          };
          
          transaction.set(invoiceItemRef, invoiceItem);
          invoiceItems.push(invoiceItem);
        }

        const order: Order = {
          id: orderRef.id,
          total_amount: total,
          created_at: new Date().toISOString(),
          uid: user.uid,
        };

        const invoice: Invoice = {
          id: invoiceRef.id,
          order_id: orderRef.id,
          invoice_number: `INV-${Date.now()}`,
          total_base: total - totalTax,
          total_tax: totalTax,
          grand_total: total,
          created_at: new Date().toISOString(),
          uid: user.uid,
        };

        transaction.set(orderRef, order);
        transaction.set(invoiceRef, invoice);

        StockEngine.commit(transaction, snapshots, items);

        const response = {
          order_id: order.id,
          invoice_id: invoice.id,
          total: total,
        };

        transaction.set(doc(db, "idempotency", idempotencyKey), {
          key: idempotencyKey,
          response,
          created_at: new Date().toISOString(),
        });

        return response;
      });

      return result;
    } catch (error) {
      console.error("Billing error:", error);
      throw error;
    }
  }
}
