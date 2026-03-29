import React, { useState } from "react";
import { collection, doc, setDoc, deleteDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase";
import { Product } from "../../types";
import { Plus, Trash2, X, Package, IndianRupee, Hash } from "lucide-react";
import { toast } from "sonner";

export default function InventoryManager({ products, inventory }: { products: Product[], inventory: any }) {
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: 0,
    gst_rate: 18,
    hsn_code: "",
    initial_stock: 0
  });

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Check if HSN already exists
      const existingProduct = products.find(p => p.hsn_code === newProduct.hsn_code);

      if (existingProduct) {
        // Merge stock
        const currentStock = inventory[existingProduct.id] || 0;
        await setDoc(doc(db, "inventory", existingProduct.id), {
          product_id: existingProduct.id,
          quantity: currentStock + Number(newProduct.initial_stock),
          last_updated: new Date().toISOString()
        }, { merge: true });
        
        toast.success(`HSN ${newProduct.hsn_code} exists. Added ${newProduct.initial_stock} to existing stock.`);
      } else {
        // Create new product
        const productRef = doc(collection(db, "products"));
        const productData = {
          name: newProduct.name,
          price: Number(newProduct.price),
          gst_rate: Number(newProduct.gst_rate),
          hsn_code: newProduct.hsn_code
        };
        
        await setDoc(productRef, productData);
        await setDoc(doc(db, "inventory", productRef.id), {
          product_id: productRef.id,
          quantity: Number(newProduct.initial_stock),
          last_updated: new Date().toISOString()
        });

        toast.success("New product added successfully");
      }

      setIsAdding(false);
      setNewProduct({ name: "", price: 0, gst_rate: 18, hsn_code: "", initial_stock: 0 });
    } catch (error) {
      toast.error("Failed to process product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteDoc(doc(db, "products", id));
      await deleteDoc(doc(db, "inventory", id));
      toast.success("Product deleted");
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  const updateStock = async (id: string, current: number, delta: number) => {
    try {
      await setDoc(doc(db, "inventory", id), {
        product_id: id,
        quantity: Math.max(0, current + delta),
        last_updated: new Date().toISOString()
      }, { merge: true });
      toast.success("Stock updated");
    } catch (error) {
      toast.error("Update failed");
    }
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Inventory</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your product catalog and stock levels.</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="bg-black text-white px-6 py-3 rounded-2xl font-medium flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
        >
          {isAdding ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {isAdding ? "Cancel" : "Add Product"}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddProduct} className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Product Name</label>
            <input
              required
              type="text"
              placeholder="e.g. Wireless Mouse"
              value={newProduct.name}
              onChange={e => setNewProduct({...newProduct, name: e.target.value})}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Price (₹)</label>
            <input
              required
              type="number"
              placeholder="0.00"
              value={newProduct.price}
              onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">GST Rate (%)</label>
            <select
              value={newProduct.gst_rate}
              onChange={e => setNewProduct({...newProduct, gst_rate: Number(e.target.value)})}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5"
            >
              <option value={0}>0% (Exempt)</option>
              <option value={5}>5%</option>
              <option value={12}>12%</option>
              <option value={18}>18%</option>
              <option value={28}>28%</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">HSN Code</label>
            <input
              required
              type="text"
              placeholder="8-digit code"
              value={newProduct.hsn_code}
              onChange={e => setNewProduct({...newProduct, hsn_code: e.target.value})}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Initial Stock</label>
            <input
              required
              type="number"
              placeholder="0"
              value={newProduct.initial_stock}
              onChange={e => setNewProduct({...newProduct, initial_stock: Number(e.target.value)})}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5"
            />
          </div>
          <div className="flex items-end">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-black text-white py-3.5 rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Processing..." : "Save Product"}
            </button>
          </div>
        </form>
      )}

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Product</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">HSN</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Price</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">GST</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map(product => (
              <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">{product.name}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{product.hsn_code}</td>
                <td className="px-6 py-4 text-sm font-semibold">₹{product.price}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{product.gst_rate}%</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-bold ${inventory[product.id] <= 5 ? "text-red-600" : "text-gray-900"}`}>
                      {inventory[product.id] || 0}
                    </span>
                    <div className="flex gap-1">
                      <button onClick={() => updateStock(product.id, inventory[product.id] || 0, 10)} className="p-1 bg-gray-100 rounded hover:bg-gray-200"><Plus className="w-3 h-3" /></button>
                      <button onClick={() => updateStock(product.id, inventory[product.id] || 0, -10)} className="p-1 bg-gray-100 rounded hover:bg-gray-200"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleDelete(product.id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {products.map(product => (
          <div key={product.id} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-gray-900">{product.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded uppercase">HSN: {product.hsn_code}</span>
                  <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded uppercase">GST: {product.gst_rate}%</span>
                </div>
              </div>
              <button onClick={() => handleDelete(product.id)} className="p-2 text-gray-400 hover:text-red-600">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Price</span>
                <span className="font-bold text-lg">₹{product.price}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Stock</span>
                <div className="flex items-center gap-3 mt-1">
                  <button onClick={() => updateStock(product.id, inventory[product.id] || 0, -10)} className="p-1.5 bg-gray-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  <span className={`font-bold ${inventory[product.id] <= 5 ? "text-red-600" : "text-gray-900"}`}>
                    {inventory[product.id] || 0}
                  </span>
                  <button onClick={() => updateStock(product.id, inventory[product.id] || 0, 10)} className="p-1.5 bg-gray-50 rounded-lg"><Plus className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
