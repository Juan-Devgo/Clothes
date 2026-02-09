import { NextRequest, NextResponse } from 'next/server';
import { jwtName } from './lib/jwt';
import { routes } from './lib/paths';

/**
 * Rutas que requieren autenticación
 * El middleware solo verifica si existe el token, no lo valida contra el CMS
 * La validación real se hace en las Server Actions cuando se necesita
 */
const protectedRoutes = [routes.CONTROL_PANEL];

/**
 * Rutas públicas de autenticación
 * Si el usuario ya tiene token, redirigir al dashboard
 */
const authRoutes = [routes.LOGIN, routes.REGISTER, routes.RESET_PASSWORD];

function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

function isAuthRoute(pathname: string): boolean {
  return authRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(jwtName)?.value;

  // Si es ruta protegida y no hay token → redirigir a login
  if (isProtectedRoute(pathname) && !token) {
    const loginUrl = new URL(routes.LOGIN, request.url);
    loginUrl.searchParams.set('from', pathname); // Para redirigir después del login
    return NextResponse.redirect(loginUrl);
  }

  // Si es ruta de auth y ya tiene token → redirigir al control panel
  if (isAuthRoute(pathname) && token) {
    return NextResponse.redirect(new URL(routes.CONTROL_PANEL, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Excluir archivos estáticos y API routes:
     * - api (API routes)
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico (favicon)
     * - Archivos con extensión (imágenes, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.[\\w]+$).*)',
  ],
};
