import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Filiales</h2>
          <div className="flex items-center justify-between">
            <p className="text-3xl font-bold">0</p>
            <Link 
              href="/admin/filiales" 
              className="text-blue-600 hover:underline"
            >
              Ver detalles →
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Programas</h2>
          <div className="flex items-center justify-between">
            <p className="text-3xl font-bold">0</p>
            <Link 
              href="/admin/programas" 
              className="text-blue-600 hover:underline"
            >
              Ver detalles →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}