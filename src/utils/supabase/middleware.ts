import { type CookieOptions, createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { SUPABASE_KEY, SUPABASE_URL } from "./constants";

// Define public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password', // Add reset-password to public routes
  '/about',
  '/contact',
  '/terms',
  '/privacy',
  '/api', // API routes might have their own auth
];

// Define routes that require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/profile',
  '/settings',
  '/documents',
  '/certificates',
  '/analysis',
];

// Define routes that should redirect to dashboard if already authenticated
const AUTH_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password'
  // Note: reset-password is intentionally not included here because
  // users need to be able to access it even when authenticated via magic link
];

// Define role types
type Role = 'ADMIN' | 'manager' | 'user';

// Define role-based route access (which roles can access which routes)
const ROLE_BASED_ACCESS: Record<Role, string[]> = {
  ADMIN: ['*'], // Admin can access everything
  manager: ['/dashboard', '/documents', '/certificates', '/analysis'],
  user: ['/dashboard', '/documents'],
};

/**
 * Middleware function to handle authentication, authorization, and session management
 * @param request The incoming request
 * @returns Response with appropriate redirects or headers
 */
export async function updateSession(request: NextRequest) {
  try {
    // Get the pathname from the request
    const pathname = request.nextUrl.pathname;

    // Initialize default response
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    // Create Supabase client
    const supabase = createServerClient(SUPABASE_URL, SUPABASE_KEY, {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    });

    // Securely get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    // Case 1: User is not authenticated
    if (userError || !user) {
      // If trying to access protected routes, redirect to login
      if (isProtectedRoute(pathname)) {
        return redirectToLogin(request);
      }
      // If trying to access public routes, allow access
      if (isPublicRoute(pathname)) {
        return response;
      }
      // For any other cases (should not occur), redirect to login
      return redirectToLogin(request);
    }

    // Case 2: User is authenticated
    // If trying to access auth routes (login, register, etc.), redirect to dashboard
    if (isAuthRoute(pathname)) {
      return redirectToDashboard(request);
    }

    // Proceed with the request if the user is authenticated
    return response;

  } catch (error) {
    console.error("Middleware error:", error);
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }
}

/**
 * Check if a path is a public route
 */
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.includes(pathname);
}

/**
 * Check if a path is a protected route
 */
function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route =>
    pathname === route || pathname.startsWith(`${route}/`)
  );
}

/**
 * Check if a path is an auth route
 */
function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.includes(pathname);
}

/**
 * Redirect to dashboard if the user is already logged in and tries to access login, register, etc.
 */
function redirectToDashboard(request: NextRequest): NextResponse {
  const redirectUrl = new URL('/dashboard', request.url);
  return NextResponse.redirect(redirectUrl);
}

/**
 * Redirect to login page
 */
function redirectToLogin(request: NextRequest): NextResponse {
  const redirectUrl = new URL('/login', request.url);
  redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
  return NextResponse.redirect(redirectUrl);
}
