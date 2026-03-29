import React, { useState } from "react";
import { Product } from "../../types";
import { Search, Plus, Package } from "lucide-react";
import { motion } from "motion/react";
import { useCart } from "../../hooks/useCart";
import { toast } from "sonner";

interface ProductCatalogProps {
  products: Product[];
  inventory: { [key: string]: number };
}

export default function ProductCatalog({ products, inventory }: ProductCatalogProps) {
  const [search, setSearch] = useState("");
  const { addItem } = useCart();

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.hsn_code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold tracking-tight">Catalog</h2>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search products or HSN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
        {filteredProducts.map((product) => {
          const stock = inventory[product.id] || 0;
          const isOutOfStock = stock <= 0;

          return (
            <motion.div
              key={product.id}
              whileHover={{ y: -4 }}
              className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                  <Package className="w-6 h-6" />
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                  isOutOfStock ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
                }`}>
                  {isOutOfStock ? "Out of Stock" : `${stock} in stock`}
                </span>
              </div>

              <h3 className="font-bold text-gray-900 mb-1">{product.name}</h3>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[10px] font-bold text-gray-400 uppercase">HSN: {product.hsn_code}</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase">•</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase">GST: {product.gst_rate}%</span>
              </div>
              
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                <span className="text-xl font-bold">₹{product.price.toLocaleString()}</span>
                <button
                  disabled={isOutOfStock}
                  onClick={() => {
                    addItem(product);
                    toast.success(`Added ${product.name} to cart`, { duration: 1000 });
                  }}
                  className="p-3 bg-gray-50 text-gray-900 rounded-xl hover:bg-black hover:text-white disabled:opacity-50 disabled:hover:bg-gray-50 disabled:hover:text-gray-900 transition-all"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
