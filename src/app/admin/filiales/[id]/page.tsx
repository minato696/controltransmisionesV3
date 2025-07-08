'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getFilial, deleteFilial } from '@/app/api/filiales';
import { getProgramasByFilial } from '@/app/api/programas';
import { Filial } from '@/app/types/filial';
import { Programa } from '@/app/types/programa';

export default function DetalleFilialPage() {
  const params = useParams();
  const router = useRouter();
  const filialId = params.id as string;
  
  const [filial, setFilial] = useState<Filial | null>(null);
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [filialData, programasData] = await Promise.all([
          getFilial(filialId),
          getProgramasByFilial(filialId)
        ]);
        
        setFilial(filialData);
        setProgramas(programasData);
        setLoading(false);
      } catch (err) {
        setError('Error al cargar los datos');
        setLoading(false);
        console.error(err);
      }
    }

    loadData();
  }, [filialId]);

  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta filial? Esta acción no se puede deshacer.')) {
      try {
        await deleteFilial(filialId);
        router.push('/admin/filiales');
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

  if (!filial) {
    return <div className="text-center p-8">No se encontró la filial</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{filial.nombre}</h1>
        <div className="flex space-x-2">
          <Link
            href={`/admin/filiales/${filialId}/editar`}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Editar
          </Link>
          <button
            onClick={handleDelete}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Eliminar
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Información de la Filial</h2>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Nombre</dt>
                  <dd className="mt-1 text-sm text-gray-900">{filial.nombre}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Descripción</dt>
                  <dd className="mt-1 text-sm text-gray-900">{filial.descripcion || '—'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Ubicación</dt>
                  <dd className="mt-1 text-sm text-gray-900">{filial.ubicacion || '—'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Estado</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <span 
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${filial.activa ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                    >
                      {filial.activa ? 'Activa' : 'Inactiva'}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Fecha de Creación</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {/* Aquí corregimos el error de fecha, verificando si fechaCreacion existe */}
                    {filial.fechaCreacion ? new Date(filial.fechaCreacion).toLocaleDateString() : '—'}
                  </dd>
                </div>
              </dl>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Programas</h2>
                <Link
                  href={`/admin/programas/nuevo?filialId=${filialId}`}
                  className="text-blue-600 hover:underline text-sm"
                >
                  + Nuevo Programa
                </Link>
              </div>
              
              {programas.length === 0 ? (
                <div className="text-center p-6 bg-gray-50 rounded">
                  <p className="text-gray-500">No hay programas asociados a esta filial</p>
                  <Link
                    href={`/admin/programas/nuevo?filialId=${filialId}`}
                    className="text-blue-600 hover:underline mt-2 inline-block"
                  >
                    Crear el primer programa
                  </Link>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {programas.map((programa) => (
                    <li key={programa.id} className="py-4">
                      <Link 
                        href={`/admin/programas/${programa.id}`}
                        className="block hover:bg-gray-50 -mx-4 -my-2 px-4 py-2 rounded transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-sm font-medium">{programa.nombre}</h3>
                            <p className="text-xs text-gray-500 mt-1">
                              {programa.fechaInicio ? new Date(programa.fechaInicio).toLocaleDateString() : '—'}
                              {programa.fechaFin && ` - ${new Date(programa.fechaFin).toLocaleDateString()}`}
                            </p>
                          </div>
                          <span 
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${programa.estado === 'activo' ? 'bg-green-100 text-green-800' : 
                                programa.estado === 'inactivo' ? 'bg-gray-100 text-gray-800' : 
                                'bg-red-100 text-red-800'}`}
                          >
                            {programa.estado === 'activo' ? 'Activo' : 
                              programa.estado === 'inactivo' ? 'Inactivo' : 'Finalizado'}
                          </span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}