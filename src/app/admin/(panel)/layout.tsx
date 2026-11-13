import Link from "next/link";
import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/admin";
import { logout } from "@/app/admin/login/actions";

export default async function PanelLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-purple-950 text-white">
      <header className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <span className="font-bold tracking-wide">DIJAH Admin</span>
        <form action={logout}>
          <button className="text-sm text-purple-200 underline">Sign out</button>
        </form>
      </header>

      <nav className="flex gap-2 border-b border-white/10 px-5 py-3 text-sm">
        <Link href="/admin" className="rounded-lg bg-white/10 px-3 py-2">
          Dashboard
        </Link>
        <Link href="/admin/products" className="rounded-lg bg-white/10 px-3 py-2">
          Products
        </Link>
        <Link href="/admin/orders" className="rounded-lg bg-white/10 px-3 py-2">
          Orders
        </Link>
      </nav>

      <div className="px-5 py-6">{children}</div>
    </div>
  );
}