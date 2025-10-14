import "./globals.css";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Supply Chain Management",
  description: "Manage suppliers, products, and orders",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h- bg-blue-100">
          <header className="border-b bg-white">
            <div className="container py-3 flex items-center justify-between">
              <Link href="/" className="font-semibold">
                Supply Chain Management
              </Link>
              <nav className="flex items-center gap-3 text-sm">
                <Link href="/suppliers">
                  Suppliers
                </Link>
                <Link href="/products">
                  Products
                </Link>
                <Link href="/orders">
                  Orders
                </Link>
              </nav>
            </div>
          </header>

          <main className="container py-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
