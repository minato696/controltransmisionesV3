'use client';

import { useState, useEffect } from 'react';
import ControlTransmisiones from '@/components/transmisiones/ControlTransmisiones';
import Link from 'next/link';

export default function Home() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Verificar si las tablas de referencia están inicializadas
  useEffect(() => {
    const checkInitialization = async () => {
      try {
        // Verificar si existen días de semana
        const response = await fetch('/api/debug');
        const data = await response.json();
        
        if (!data.diasSemana || data.diasSemana.length === 0) {
          setError('La base de datos no está inicializada. Por favor, vaya al panel de administración para inicializarla.');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error al verificar inicialización:', err);
        setError('Error al verificar el estado de la base de datos.');
        setLoading(false);
      }
    };

    checkInitialization();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-yellow-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-xl font-semibold mb-4">Inicialización Requerida</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link 
            href="/admin" 
            className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition-colors inline-block"
          >
            Ir al Panel de Administración
          </Link>
        </div>
      </div>
    );
  }

  return <ControlTransmisiones />;
}