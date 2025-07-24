'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface AuthWrapperProps {
  children: React.ReactNode;
}

const PUBLIC_PATHS = ['/login'];

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    // Check if we're on a public path
    const isPublicPath = PUBLIC_PATHS.includes(pathname);
    
    if (!isAuthenticated && !isPublicPath) {
      // Redirect to login if not authenticated and not on a public path
      router.push('/login');
    } else if (isAuthenticated && isPublicPath) {
      // Redirect to home if authenticated and on a public path
      router.push('/');
    } else {
      // If no redirect is needed, render the children
      setShouldRender(true);
    }
    
    setIsChecking(false);
  }, [isAuthenticated, pathname, router]);

  if (isChecking) {
    // Show loading state while checking authentication
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Only render children if we've determined it's safe to do so
  return shouldRender ? <>{children}</> : (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redireccionando...</p>
      </div>
    </div>
  );
}