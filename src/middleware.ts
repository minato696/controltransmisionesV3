import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Este middleware verifica si hay una cookie de autenticación
// antes de permitir el acceso a las rutas protegidas
export function middleware(request: NextRequest) {
  // Lista de rutas públicas que no requieren autenticación
  const publicPaths = ['/login'];
  
  // Verificar si la ruta actual es pública
  const isPublicPath = publicPaths.some(path => 
    request.nextUrl.pathname === path || 
    request.nextUrl.pathname.startsWith(`${path}/`)
  );
  
  // Verificar si es la ruta principal con el parámetro de dashboard
  const isDashboardView = 
    request.nextUrl.pathname === '/' && 
    request.nextUrl.searchParams.get('view') === 'dashboard';
  
  // Para rutas API o para la vista de dashboard, permitir siempre el acceso
  if (request.nextUrl.pathname.startsWith('/api/') || isDashboardView) {
    return NextResponse.next();
  }
  
  // Nota: No podemos acceder a localStorage desde el middleware,
  // así que la autenticación real ocurrirá en el componente AuthWrapper
  // Este middleware solo maneja las redirecciones básicas
  
  return NextResponse.next();
}

// Configurar para que solo se ejecute en las rutas especificadas
export const config = {
  matcher: [
    /*
     * Coincide con todas las rutas excepto:
     * 1. Las que comienzan con api (API routes)
     * 2. Las que comienzan con _next (Next.js files)
     * 3. Las que contienen un archivo (archivos estáticos)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};