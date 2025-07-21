'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { getFiliales } from '@/app/api/filiales';
import { getProgramas } from '@/app/api/programas';

export default function AdminDashboard() {
  const [filialesCount, setFilialesCount] = useState(0);
  const [programasCount, setProgramasCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [filiales, programas] = await Promise.all([
          getFiliales(),
          getProgramas()
        ]);
        
        setFilialesCount(filiales.length);
        setProgramasCount(programas.length);
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar datos del dashboard:', err);
        setError('Error al cargar datos');
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded border border-red-200">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="text-center p-4">Cargando datos...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Filiales</h2>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold">{filialesCount}</p>
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
              <p className="text-3xl font-bold">{programasCount}</p>
              <Link 
                href="/admin/programas" 
                className="text-blue-600 hover:underline"
              >
                Ver detalles →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}