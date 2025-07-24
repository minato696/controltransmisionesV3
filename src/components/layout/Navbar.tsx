'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

// Este componente se mantiene, pero ya no se utilizará para mostrar
// las opciones de usuario, que ahora están en el Sidebar
export default function Navbar() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return null;
  }

  // Barra de navegación minimalista sin contenido
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 flex items-center shadow-md z-20">
      {/* Se mantiene el div vacío para conservar la estructura */}
      <div className="ml-auto"></div>
    </div>
  );
}