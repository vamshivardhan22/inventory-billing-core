import React, { useState } from "react";
import { useCart } from "../../hooks/useCart";
import { BillingService } from "../../services/billing_service";
import { ShoppingCart, Trash2, Minus, Plus, CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

export default function Cart({ products, inventory }: { products: any[], inventory: any }) {
  const { items, removeItem, updateQuantity, clearCart, total } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckout = async () => {
    if (items.length === 0) return;
    
    setIsProcessing(true);
    const idempotencyKey = `order-${Date.now()}`;
    
    try {
      const orderItems = items.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity
      }));
      
      await BillingService.createOrder(idempotencyKey, orderItems);
      toast.success("Order placed successfully!");
      clearCart();
    } catch (error: any) {
      toast.error(error.message || "Checkout failed");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col h-[calc(100vh-200px)] md:h-[calc(100vh-160px)] md:sticky md:top-10">
      <div className="p-5 md:p-6 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          <h2 className="font-bold">Order</h2>
        </div>
        <span className="bg-black text-white text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider">
          {items.length} items
        </span>
      </div>

      <div className="flex-1 overflow-auto p-5 md:p-6 space-y-4">
        <AnimatePresence initial={false}>
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2">
              <ShoppingCart className="w-12 h-12 opacity-10" />
              <p className="text-sm font-medium">Your cart is empty</p>
            </div>
          ) : (
            items.map((item) => (
              <motion.div
                key={item.product.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex gap-4 group bg-gray-50/50 p-3 rounded-2xl border border-transparent hover:border-gray-100 transition-all"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-gray-900 truncate">{item.product.name}</h4>
                  <p className="text-xs text-gray-500 font-medium">₹{item.product.price} / unit</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-white rounded-xl p-1 shadow-sm border border-gray-100">
                    <button 
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="p-1 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="p-1 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <button 
                    onClick={() => removeItem(item.product.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      <div className="p-5 md:p-6 bg-gray-50/50 rounded-b-3xl space-y-4 border-t border-gray-100">
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-wider">
            <span>Subtotal</span>
            <span>₹{(total * 0.82).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-wider">
            <span>GST (18%)</span>
            <span>₹{(total * 0.18).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t border-gray-200">
            <span>Total</span>
            <span>₹{total.toLocaleString()}</span>
          </div>
        </div>

        <button
          disabled={items.length === 0 || isProcessing}
          onClick={handleCheckout}
          className="w-full bg-black text-white rounded-2xl py-4 font-bold flex items-center justify-center gap-2 hover:bg-gray-800 disabled:opacity-50 disabled:hover:bg-black transition-all shadow-lg shadow-black/10"
        >
          {isProcessing ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              Checkout
            </>
          )}
        </button>
      </div>
    </div>
  );
}
