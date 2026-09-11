import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CartProvider } from "./lib/cart";
import { HomePage } from "./pages/HomePage";
import { AdminPage } from "./pages/AdminPage";
import { PrintPage } from "./pages/PrintPage";
import { ShopPage } from "./pages/ShopPage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { CartPage } from "./pages/CartPage";
import { CustomizePage } from "./pages/CustomizePage";
import { ShopLoginPage } from "./pages/ShopLoginPage";
import { ShopDashboardPage } from "./pages/ShopDashboardPage";

function AnimatedRoutes() {
  const location = useLocation();
  const reduceMotion = useReducedMotion();
  const isPrint = location.pathname.startsWith("/print");

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={reduceMotion || isPrint ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduceMotion || isPrint ? undefined : { opacity: 0, y: -6 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        <Routes location={location}>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/shop/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/customize" element={<CustomizePage />} />
          <Route path="/print/:shopCode" element={<PrintPage />} />
          <Route path="/shop-login" element={<ShopLoginPage />} />
          <Route path="/shop-dashboard" element={<ShopDashboardPage />} />
          <Route path="/fps-admin" element={<AdminPage />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <AnimatedRoutes />
      </CartProvider>
    </BrowserRouter>
  );
}
