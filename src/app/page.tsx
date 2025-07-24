'use client';

import { useState, useEffect } from 'react';
import ControlTransmisiones from '@/components/transmisiones/ControlTransmisiones';
import DashboardGeneral from '@/components/dashboard/DashboardGeneral';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

export default function Home() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mostrarDashboard, setMostrarDashboard] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

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

    // Verificar si estamos en modo dashboard
    const view = searchParams.get('view');
    setMostrarDashboard(view === 'dashboard');
  }, [searchParams]);

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

  // Cambiar entre vistas
  const toggleDashboard = () => {
    if (mostrarDashboard) {
      router.push('/');
    } else {
      router.push('/?view=dashboard');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Barra de navegación */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-2 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-blue-600">
            Sistema de Control de Transmisiones
          </Link>
          <div className="flex space-x-2">
            <button
              onClick={toggleDashboard}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors flex items-center"
            >
              {mostrarDashboard ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Volver a Control
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Ver Dashboard
                </>
              )}
            </button>
            <Link
              href="/admin"
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Panel Admin
            </Link>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1">
        {mostrarDashboard ? <DashboardGeneral /> : <ControlTransmisiones />}
      </div>
    </div>
  );
}