import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Panel de Administración",
  description: "Panel de administración para gestionar filiales y programas",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <div className="p-6 border-b">
          <h1 className="text-xl font-semibold">Admin Panel</h1>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <Link 
                href="/admin" 
                className="block p-2 rounded hover:bg-gray-100 transition-colors"
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/filiales" 
                className="block p-2 rounded hover:bg-gray-100 transition-colors"
              >
                Filiales
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/programas" 
                className="block p-2 rounded hover:bg-gray-100 transition-colors"
              >
                Programas
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}