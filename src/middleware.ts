import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define the protected routes and their required user types
const protectedRoutes: { [key: string]: string[] } = {
  '/admin': ['admin'],
  '/student': ['student'],
  '/teacher': ['teacher'],
  '/parent': ['parent'],
};

// Define the default redirect paths for each user type
const defaultPaths: { [key: string]: string } = {
  admin: '/admin',
  student: '/student',
  teacher: '/teacher',
  parent: '/parent',
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userType = request.cookies.get('user_type')?.value;

  // Find which protected route the user is trying to access
  const protectedRoute = Object.keys(protectedRoutes).find(route => pathname.startsWith(route));

  if (protectedRoute) {
    // If the user is not logged in, redirect to login
    if (!userType) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // If the user's type does not match the required type for the route
    if (!protectedRoutes[protectedRoute].includes(userType)) {
      // Redirect them to their own dashboard
      const userDefaultPath = defaultPaths[userType];
      if (userDefaultPath) {
        return NextResponse.redirect(new URL(userDefaultPath, request.url));
      }
      // If for some reason they have an invalid type, log them out
      return NextResponse.redirect(new URL('/logout', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public images)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
  ],
}
