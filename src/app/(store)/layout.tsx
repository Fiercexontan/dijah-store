import type { ReactNode } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { CartProvider } from "@/lib/cart";

export default function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <SiteHeader />
      {children}
      <SiteFooter />
    </CartProvider>
  );
}