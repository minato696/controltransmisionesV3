'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface AuthWrapperProps {
  children: React.ReactNode;
}

const PUBLIC_PATHS = ['/login'];

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const { isAuthenticated, isInitialized } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isChecking, setIsChecking] = useState(true);
  const [shouldRender, setShouldRender] = useState(false);

  // Obtener el parámetro de vista para identificar si estamos en modo dashboard
  const viewParam = searchParams.get('view');
  const isDashboardView = viewParam === 'dashboard';

  useEffect(() => {
    // No hacer nada hasta que el estado de autenticación esté inicializado
    if (!isInitialized) {
      return;
    }

    // Verificar si estamos en una ruta pública
    const isPublicPath = PUBLIC_PATHS.includes(pathname);
    
    // Si es la vista del dashboard, permitir acceso (será manejado dentro del componente)
    if (isDashboardView && pathname === '/') {
      setIsChecking(false);
      setShouldRender(true);
      return;
    }
    
    if (!isAuthenticated && !isPublicPath) {
      // Redirigir a login si no está autenticado y no es una ruta pública
      router.push('/login');
    } else if (isAuthenticated && isPublicPath) {
      // Redirigir a home si está autenticado y está en una ruta pública
      router.push('/');
    } else {
      // Si no se necesita redirección, renderizar los hijos
      setShouldRender(true);
    }
    
    setIsChecking(false);
  }, [isAuthenticated, isInitialized, pathname, router, isDashboardView, searchParams]);

  if (!isInitialized || isChecking) {
    // Mostrar estado de carga mientras se verifica la autenticación
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Solo renderizar hijos si es seguro hacerlo
  return shouldRender ? <>{children}</> : (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redireccionando...</p>
      </div>
    </div>
  );
}