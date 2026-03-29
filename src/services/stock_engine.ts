import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import { Product, Inventory } from "../types";

export class StockEngine {
  static async reserve(transaction: any, items: { product_id: string; quantity: number }[]) {
    const snapshots: { [key: string]: Inventory } = {};
    const products: { [key: string]: Product } = {};

    for (const item of items) {
      const productDoc = await transaction.get(doc(db, "products", item.product_id));
      if (!productDoc.exists()) {
        throw new Error(`Product ${item.product_id} not found`);
      }
      products[item.product_id] = { id: productDoc.id, ...productDoc.data() } as Product;

      const inventoryDoc = await transaction.get(doc(db, "inventory", item.product_id));
      if (!inventoryDoc.exists()) {
        throw new Error(`Inventory for product ${item.product_id} not found`);
      }
      const inventory = { product_id: inventoryDoc.id, ...inventoryDoc.data() } as Inventory;
      
      if (inventory.quantity < item.quantity) {
        throw new Error(`Insufficient stock for ${products[item.product_id].name}`);
      }
      
      snapshots[item.product_id] = inventory;
    }

    return { snapshots, products };
  }

  static commit(
    transaction: any,
    snapshots: { [key: string]: Inventory },
    items: { product_id: string; quantity: number }[]
  ) {
    for (const item of items) {
      const snapshot = snapshots[item.product_id];
      const newQuantity = snapshot.quantity - item.quantity;
      
      transaction.update(doc(db, "inventory", item.product_id), {
        quantity: newQuantity,
        last_updated: new Date().toISOString(),
      });
    }
  }
}
