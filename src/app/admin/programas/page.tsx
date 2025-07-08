'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getProgramas, deletePrograma } from '@/app/api/programas';
import { getFiliales } from '@/app/api/filiales';
import { Programa } from '@/app/types/programa';
import { Filial } from '@/app/types/filial';

export default function ProgramasList() {
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [filiales, setFiliales] = useState<Record<string | number, Filial>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [programasData, filialesData] = await Promise.all([
          getProgramas(),
          getFiliales()
        ]);
        
        setProgramas(programasData);
        
        // Crear un objeto para buscar filiales por ID
        const filialesMap: Record<string | number, Filial> = {};
        filialesData.forEach(filial => {
          filialesMap[filial.id] = filial;
        });
        setFiliales(filialesMap);
        
        setLoading(false);
      } catch (err) {
        setError('Error al cargar los datos');
        setLoading(false);
        console.error(err);
      }
    }

    loadData();
  }, []);

  const handleDelete = async (id: string | number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este programa?')) {
      try {
        await deletePrograma(id);
        setProgramas(programas.filter(programa => programa.id !== id));
      } catch (err) {
        setError('Error al eliminar el programa');
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
        <h1 className="text-2xl font-bold">Programas</h1>
        <Link 
          href="/admin/programas/nuevo" 
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          Nuevo Programa
        </Link>
      </div>
      
      {programas.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p>No hay programas registrados</p>
          <Link 
            href="/admin/programas/nuevo" 
            className="text-blue-600 hover:underline mt-2 inline-block"
          >
            Crear el primer programa
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Filial</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fechas</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {programas.map((programa) => (
                <tr key={programa.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{programa.nombre}</div>
                    <div className="text-xs text-gray-500 truncate max-w-xs">{programa.descripcion}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {filiales[programa.filialId]?.nombre || 'Desconocida'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(programa.fechaInicio).toLocaleDateString()}
                      {programa.fechaFin && ` - ${new Date(programa.fechaFin).toLocaleDateString()}`}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span 
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${programa.estado === 'activo' ? 'bg-green-100 text-green-800' : 
                          programa.estado === 'inactivo' ? 'bg-gray-100 text-gray-800' : 
                          'bg-red-100 text-red-800'}`}
                    >
                      {programa.estado === 'activo' ? 'Activo' : 
                        programa.estado === 'inactivo' ? 'Inactivo' : 'Finalizado'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Link 
                        href={`/admin/programas/${programa.id}`} 
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Ver
                      </Link>
                      <Link 
                        href={`/admin/programas/${programa.id}/editar`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Editar
                      </Link>
                      <button
                        onClick={() => handleDelete(programa.id)}
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