import { useState, useEffect, useCallback } from "react";
import { Product } from "../types";

interface CartItem {
  product: Product;
  quantity: number;
}

let cartItems: CartItem[] = [];
let listeners: (() => void)[] = [];

function notify() {
  listeners.forEach(l => l());
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(cartItems);

  useEffect(() => {
    const listener = () => setItems([...cartItems]);
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }, []);

  const addItem = useCallback((product: Product) => {
    const existing = cartItems.find(item => item.product.id === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cartItems.push({ product, quantity: 1 });
    }
    notify();
  }, []);

  const removeItem = useCallback((productId: string) => {
    cartItems = cartItems.filter(item => item.product.id !== productId);
    notify();
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    const item = cartItems.find(item => item.product.id === productId);
    if (item) {
      item.quantity = Math.max(1, quantity);
      notify();
    }
  }, []);

  const clearCart = useCallback(() => {
    cartItems = [];
    notify();
  }, []);

  const total = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  return { items, addItem, removeItem, updateQuantity, clearCart, total };
}
