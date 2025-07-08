'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getFiliales, deleteFilial } from '@/app/api/filiales';
import { Filial } from '@/app/types/filial';

export default function FilialesList() {
  const [filiales, setFiliales] = useState<Filial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadFiliales() {
      try {
        const data = await getFiliales();
        setFiliales(data);
        setLoading(false);
      } catch (err) {
        setError('Error al cargar filiales');
        setLoading(false);
        console.error(err);
      }
    }

    loadFiliales();
  }, []);

  const handleDelete = async (id: string | number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta filial?')) {
      try {
        await deleteFilial(id);
        setFiliales(filiales.filter(filial => filial.id !== id));
      } catch (err) {
        setError('Error al eliminar la filial');
        console.error(err);
      }
    }
  };

  if (loading) {
    return <div className="text-center p-8">Cargando...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 p-8">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Filiales</h1>
        <Link 
          href="/admin/filiales/nueva" 
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          Nueva Filial
        </Link>
      </div>
      
      {filiales.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p>No hay filiales registradas</p>
          <Link 
            href="/admin/filiales/nueva" 
            className="text-blue-600 hover:underline mt-2 inline-block"
          >
            Crear la primera filial
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ubicación</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filiales.map((filial) => (
                <tr key={filial.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{filial.nombre}</div>
                    {filial.descripcion && (
                      <div className="text-sm text-gray-500">{filial.descripcion}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{filial.ubicacion || '—'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span 
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${filial.activa ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                    >
                      {filial.activa ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Link 
                        href={`/admin/filiales/${filial.id}`} 
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Ver
                      </Link>
                      <Link 
                        href={`/admin/filiales/${filial.id}/editar`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Editar
                      </Link>
                      <button
                        onClick={() => handleDelete(filial.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}