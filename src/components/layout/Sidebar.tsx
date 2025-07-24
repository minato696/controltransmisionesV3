'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface SidebarProps {
  filiales?: Array<{ id: string | number; nombre: string }>;
  onFilialSelect?: (filialId: number) => void;
  filialSeleccionada?: number | null;
}

export default function Sidebar({ filiales = [], onFilialSelect, filialSeleccionada }: SidebarProps) {
  const [sidebarVisible, setSidebarVisible] = useState<boolean>(true);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div 
      className={`
        w-64 bg-gray-900 text-white shadow-lg z-30 flex flex-col
        transition-all duration-300
        ${sidebarVisible ? 'translate-x-0' : '-translate-x-full'} 
        fixed h-full md:relative
      `}
    >
      {/* Título principal con mejor tipografía */}
      <div className="p-5 border-b border-gray-700 flex items-center">
        <img src="https://statics.exitosanoticias.pe/exitosa/img/global/exitosa.svg" alt="Exitosa" className="h-8 mr-3" />
        <div className="flex flex-col">
          <h1 className="text-xl font-bold tracking-wide">Sistema Control</h1>
          <h2 className="text-lg font-bold tracking-wide">de Transmisiones</h2>
        </div>
      </div>
      
      {/* Contenedor principal de scroll */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600">
        {/* Opción de Resumen General en el menú lateral */}
        <div
          className={`flex items-center px-6 py-4 cursor-pointer hover:bg-gray-800 transition-colors border-l-4 ${
            pathname === '/' ? "border-blue-500" : "border-transparent"
          }`}
          onClick={() => {
            if (typeof window !== 'undefined') {
              window.location.href = '/';
            }
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span className={pathname === '/' ? "text-blue-300 font-medium" : ""}>
            Resumen General
          </span>
        </div>
        
        <div className="px-6 py-4 text-lg font-bold text-gray-300 border-b border-gray-700">
          Filiales
        </div>
        
        {/* Lista de filiales con scroll mejorado */}
        <div className="py-2">
          {filiales.length === 0 ? (
            <div className="px-6 py-3 text-sm text-gray-400">
              No hay filiales disponibles
            </div>
          ) : (
            filiales.map((filial) => (
              <div
                key={filial.id}
                className={`flex items-center px-6 py-3 cursor-pointer hover:bg-gray-800 transition-colors border-l-4 ${
                  filialSeleccionada === Number(filial.id) ? "border-blue-500 bg-gray-800" : "border-transparent"
                }`}
                onClick={() => {
                  if (onFilialSelect) {
                    onFilialSelect(Number(filial.id));
                  }
                  
                  // En móviles, cerrar el sidebar después de seleccionar
                  if (window.innerWidth < 768) {
                    setSidebarVisible(false);
                  }
                }}
              >
                <span className={filialSeleccionada === Number(filial.id) ? "text-blue-300 font-medium" : ""}>
                  {filial.nombre}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Opciones de usuario y cerrar sesión */}
      <div className="border-t border-gray-700 p-4">
        {user && (
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-blue-500 h-8 w-8 rounded-full flex items-center justify-center mr-2">
                <span className="text-white font-medium">{user.charAt(0).toUpperCase()}</span>
              </div>
              <div className="text-sm text-gray-300">{user}</div>
            </div>
            <button 
              onClick={logout}
              className="text-gray-400 hover:text-red-400 transition-colors focus:outline-none"
              aria-label="Cerrar sesión"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        )}

        <Link 
          href="/admin"
          className="mt-3 w-full flex items-center justify-center py-2 px-4 bg-gray-800 text-sm text-gray-300 rounded hover:bg-gray-700 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Panel de Administración
        </Link>
      </div>
      
      {/* Información del sistema - Footer */}
      <div className="border-t border-gray-700 p-4 text-center text-sm text-gray-400 bg-gray-900">
        <div className="font-medium text-gray-300">Area Sistemas</div>
        <div>Radio Exitosa</div>
        <div className="mt-1">Versión 2.4.0 © 2025</div>
      </div>
    </div>
  );
}