import React, { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User } from "firebase/auth";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { Toaster, toast } from "sonner";
import { LayoutDashboard, ShoppingCart, Package, LogIn, LogOut, Loader2, Menu, X as CloseIcon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Product } from "./types";
import ProductCatalog from "./components/POS/ProductCatalog";
import Cart from "./components/POS/Cart";
import InventoryManager from "./components/Inventory/InventoryManager";
import Reports from "./components/Dashboard/Reports";
import { cn } from "./lib/utils";

type View = "pos" | "inventory" | "reports" | "cart";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<View>("pos");
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<{ [key: string]: number }>({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const qProducts = query(collection(db, "products"), orderBy("name"));
    const unsubProducts = onSnapshot(qProducts, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
    });

    const unsubInventory = onSnapshot(collection(db, "inventory"), (snapshot) => {
      const inv: { [key: string]: number } = {};
      snapshot.docs.forEach(doc => {
        inv[doc.id] = doc.data().quantity;
      });
      setInventory(inv);
    });

    return () => {
      unsubProducts();
      unsubInventory();
    };
  }, [user]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      toast.success("Logged in successfully");
    } catch (error) {
      toast.error("Login failed");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#f5f5f5]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#f5f5f5] p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-3xl p-10 shadow-sm border border-gray-100 text-center"
        >
          <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900 mb-2">GST Billing Engine</h1>
          <p className="text-gray-500 mb-8">Secure, real-time retail management with GST compliance.</p>
          <button
            onClick={handleLogin}
            className="w-full bg-black text-white rounded-2xl py-4 font-medium flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
          >
            <LogIn className="w-5 h-5" />
            Sign in with Google
          </button>
        </motion.div>
      </div>
    );
  }

  const navigationItems = [
    { id: "pos", label: "POS", icon: <ShoppingCart className="w-5 h-5" /> },
    { id: "inventory", label: "Stock", icon: <Package className="w-5 h-5" /> },
    { id: "reports", label: "Reports", icon: <LayoutDashboard className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col md:flex-row">
      <Toaster position="top-center" />
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 bg-white border-r border-gray-100 flex-col p-6 sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
            <ShoppingCart className="text-white w-5 h-5" />
          </div>
          <span className="font-semibold text-lg tracking-tight">GST POS</span>
        </div>

        <nav className="flex-1 space-y-2">
          {navigationItems.map(item => (
            <SidebarNavItem 
              key={item.id}
              icon={item.icon} 
              label={item.label} 
              active={currentView === item.id} 
              onClick={() => setCurrentView(item.id as View)} 
            />
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-gray-100">
          <div className="flex items-center gap-3 px-2 mb-4">
            <img src={user.photoURL || ""} alt={user.displayName || ""} className="w-10 h-10 rounded-full border border-gray-100" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.displayName}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b border-gray-100 p-4 sticky top-0 z-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <ShoppingCart className="text-white w-4 h-4" />
          </div>
          <span className="font-semibold tracking-tight">GST POS</span>
        </div>
        <div className="flex items-center gap-2">
          {currentView === "pos" && (
            <button 
              onClick={() => setCurrentView("cart")}
              className="p-2 bg-gray-50 rounded-lg relative"
            >
              <ShoppingCart className="w-5 h-5" />
            </button>
          )}
          <button onClick={() => setIsSidebarOpen(true)} className="p-2">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] md:hidden"
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="fixed right-0 top-0 bottom-0 w-80 bg-white z-[70] p-6 flex flex-col md:hidden"
            >
              <div className="flex justify-between items-center mb-10">
                <span className="font-bold text-xl">Menu</span>
                <button onClick={() => setIsSidebarOpen(false)}><CloseIcon /></button>
              </div>
              <div className="flex items-center gap-3 mb-8">
                <img src={user.photoURL || ""} alt={user.displayName || ""} className="w-12 h-12 rounded-full" />
                <div>
                  <p className="font-bold">{user.displayName}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-red-600 font-medium mb-10"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-10 overflow-auto pb-24 md:pb-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {currentView === "pos" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
                <div className="lg:col-span-2">
                  <ProductCatalog products={products} inventory={inventory} />
                </div>
                <div className="hidden lg:block lg:col-span-1">
                  <Cart products={products} inventory={inventory} />
                </div>
              </div>
            )}
            {currentView === "cart" && (
              <div className="max-w-md mx-auto">
                <button 
                  onClick={() => setCurrentView("pos")}
                  className="mb-4 text-sm font-medium text-gray-500 flex items-center gap-1"
                >
                  ← Back to Catalog
                </button>
                <Cart products={products} inventory={inventory} />
              </div>
            )}
            {currentView === "inventory" && <InventoryManager products={products} inventory={inventory} />}
            {currentView === "reports" && <Reports />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around p-3 z-50">
        {navigationItems.map(item => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id as View)}
            className={cn(
              "flex flex-col items-center gap-1 p-2 transition-colors",
              currentView === item.id ? "text-black" : "text-gray-400"
            )}
          >
            {item.icon}
            <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

function SidebarNavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void, key?: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all duration-200",
        active 
          ? "bg-black text-white shadow-lg shadow-black/10" 
          : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
      )}
    >
      {icon}
      {label}
    </button>
  );
}
