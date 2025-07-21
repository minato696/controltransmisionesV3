// ===================================================================
// ARCHIVO: src/app/admin/programas/[id]/page.tsx
// ===================================================================
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getPrograma, deletePrograma } from '@/app/api/programas';
import { getFilial } from '@/app/api/filiales';
import { Programa } from '@/app/types/programa';
import { Filial } from '@/app/types/filial';

export default function DetalleProgramaPage() {
  const params = useParams();
  const router = useRouter();
  const programaId = params.id as string;
  
  const [programa, setPrograma] = useState<Programa | null>(null);
  const [filial, setFilial] = useState<Filial | null>(null);
  const [filiales, setFiliales] = useState<Filial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const programaData = await getPrograma(programaId);
        setPrograma(programaData);
        
        // Cargar todas las filiales asociadas
        const filialesAsociadas: Filial[] = [];
        if (programaData.filialesIds && programaData.filialesIds.length > 0) {
          for (const filialId of programaData.filialesIds) {
            try {
              const filialData = await getFilial(filialId);
              filialesAsociadas.push(filialData);
            } catch (err) {
              console.error(`Error al cargar filial ${filialId}:`, err);
            }
          }
        } else if (programaData.filialId) {
          // Compatibilidad con programas que solo tienen una filial
          try {
            const filialData = await getFilial(programaData.filialId);
            filialesAsociadas.push(filialData);
          } catch (err) {
            console.error('Error al cargar la filial:', err);
          }
        }
        
        setFiliales(filialesAsociadas);
        if (filialesAsociadas.length > 0) {
          setFilial(filialesAsociadas[0]); // Mantener compatibilidad
        }
        
        setLoading(false);
      } catch (err) {
        setError('Error al cargar los datos del programa');
        setLoading(false);
        console.error(err);
      }
    }

    loadData();
  }, [programaId]);

  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este programa? Esta acción no se puede deshacer.')) {
      try {
        await deletePrograma(programaId);
        router.push('/admin/programas');
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

  if (!programa) {
    return <div className="text-center p-8">No se encontró el programa</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{programa.nombre}</h1>
        <div className="flex space-x-2">
          <Link
            href={`/admin/programas/${programaId}/editar`}
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
              <h2 className="text-lg font-semibold mb-4">Información del Programa</h2>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Nombre</dt>
                  <dd className="mt-1 text-sm text-gray-900">{programa.nombre}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Descripción</dt>
                  <dd className="mt-1 text-sm text-gray-900">{programa.descripcion}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Filiales</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {filiales.length > 0 ? (
                      <div className="space-y-1">
                        {filiales.map((filial) => (
                          <Link 
                            key={filial.id}
                            href={`/admin/filiales/${filial.id}`}
                            className="text-blue-600 hover:underline block"
                          >
                            {filial.nombre}
                          </Link>
                        ))}
                      </div>
                    ) : (
                      'Sin filiales asignadas'
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Fecha de Inicio</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(programa.fechaInicio).toLocaleDateString()}
                  </dd>
                </div>
                {programa.fechaFin && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Fecha de Fin</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(programa.fechaFin).toLocaleDateString()}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-gray-500">Estado</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <span 
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${programa.estado === 'activo' ? 'bg-green-100 text-green-800' : 
                          programa.estado === 'inactivo' ? 'bg-gray-100 text-gray-800' : 
                          'bg-red-100 text-red-800'}`}
                    >
                      {programa.estado === 'activo' ? 'Activo' : 
                        programa.estado === 'inactivo' ? 'Inactivo' : 'Finalizado'}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
            
            <div className="bg-gray-50 p-4 rounded">
              <h2 className="text-lg font-semibold mb-4">Acciones Rápidas</h2>
              <div className="space-y-2">
                <Link
                  href={`/admin/programas/${programaId}/editar`}
                  className="block w-full text-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  Editar Programa
                </Link>
                {filiales.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Ver filiales:</p>
                    {filiales.map((filial) => (
                      <Link
                        key={filial.id}
                        href={`/admin/filiales/${filial.id}`}
                        className="block w-full text-center bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors text-sm"
                      >
                        {filial.nombre}
                      </Link>
                    ))}
                  </div>
                )}
                <button
                  onClick={handleDelete}
                  className="block w-full text-center bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                >
                  Eliminar Programa
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}