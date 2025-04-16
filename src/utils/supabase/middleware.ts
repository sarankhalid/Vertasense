import { type CookieOptions, createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { SUPABASE_KEY, SUPABASE_URL } from "./constants";

// Define public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password', // Add reset-password to public routes
  '/',
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

    if (userError) {
      console.error("Error fetching authenticated user:", userError);
      // Clear any invalid auth cookies and redirect to login for protected routes
      if (isProtectedRoute(pathname)) {
        return redirectToLogin(request);
      }
      return response;
    }

    // // Log user information for debugging
    // console.log("USER:", user ? `ID: ${user.id}, Email: ${user.email}` : "Not authenticated");

    // // Check route access based on authentication status
    // if (!user) {
    //   // User is not authenticated
    //   if (isProtectedRoute(pathname)) {
    //     console.log(`Unauthenticated access attempt to protected route: ${pathname}`);
    //     return redirectToLogin(request);
    //   }

    //   // Allow access to public routes
    //   return response;
    // }

    // // User is authenticated - check if they're trying to access auth routes
    // if (isAuthRoute(pathname)) {
    //   console.log(`Authenticated user attempting to access auth route: ${pathname}`);
    //   return redirectToDashboard(request);
    // }

    // // Check if user metadata already contains role and organizationId
    // const needsMetadataUpdate = !user.user_metadata?.role || !user.user_metadata?.organizationId;

    // // If metadata update is needed, fetch role and organization info
    // let userRole = user.user_metadata?.role;
    // let organizationId = user.user_metadata?.organizationId;

    // if (needsMetadataUpdate) {
    //   console.log("User metadata needs update, fetching role and organization data");

    //   try {
    //     // Get the user's role_id and organization_id from org_users table
    //     const { data: orgUser, error: orgUserError } = await supabase
    //       .from('org_users')
    //       .select('role_id, organization_id')
    //       .eq('user_id', user.id)
    //       .single();

    //     if (orgUserError) {
    //       console.error("Error fetching user organization data:", orgUserError);
    //     } else if (orgUser) {
    //       // Store the organization ID
    //       organizationId = orgUser.organization_id;

    //       // Get the role name from roles table
    //       const { data: role, error: roleError } = await supabase
    //         .from('roles')
    //         .select('name')
    //         .eq('id', orgUser.role_id)
    //         .single();

    //       if (roleError) {
    //         console.error("Error fetching role details:", roleError);
    //       } else if (role) {
    //         userRole = role.name;
    //         console.log(`User role: ${userRole}, Organization ID: ${organizationId}`);

    //         // Update the user metadata only if needed
    //         try {
    //           await supabase.auth.updateUser({
    //             data: {
    //               role: userRole,
    //               organizationId: organizationId
    //             }
    //           });

    //           console.log("User token updated with role and organization ID");
    //         } catch (error) {
    //           console.error("Error updating user token:", error);
    //         }
    //       }
    //     }
    //   } catch (error) {
    //     console.error("Error in role/organization processing:", error);
    //   }
    // } else {
    //   console.log("User metadata already contains role and organizationId, skipping update");
    // }

    // // Check role-based access for protected routes
    // if (isProtectedRoute(pathname) && userRole && !hasRoleAccess(userRole, pathname)) {
    //   console.log(`Access denied: User with role ${userRole} attempted to access ${pathname}`);
    //   // Redirect to dashboard or access denied page
    //   return redirectToDashboard(request);
    // }

    // Create a new response with the user role and organization information
    const newResponse = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    // Add user information to response headers for downstream use
    // if (userRole) {
    //   newResponse.headers.set('x-user-role', userRole);
    // }

    // if (organizationId) {
    //   newResponse.headers.set('x-organization-id', organizationId);
    // }

    return newResponse;

  } catch (error) {
    console.error("Middleware error:", error);
    // Return default response in case of errors
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }
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
 * Check if a user with the given role has access to the specified path
 */
function hasRoleAccess(role: string, pathname: string): boolean {
  // Check if the role is a valid key in our role-based access configuration
  if (!(role as Role in ROLE_BASED_ACCESS)) {
    return false;
  }

  // Admin has access to everything
  if (role === 'ADMIN') {
    return true;
  }

  // Check if the role has access to the specific path or a wildcard
  return ROLE_BASED_ACCESS[role as Role].some((route: string) =>
    route === '*' || pathname === route || pathname.startsWith(`${route}/`)
  );
}

/**
 * Redirect to login page
 */
function redirectToLogin(request: NextRequest): NextResponse {
  const redirectUrl = new URL('/login', request.url);
  // Add the original URL as a query parameter for post-login redirect
  redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
  return NextResponse.redirect(redirectUrl);
}

/**
 * Redirect to dashboard
 */
function redirectToDashboard(request: NextRequest): NextResponse {
  const redirectUrl = new URL('/dashboard', request.url);
  return NextResponse.redirect(redirectUrl);
}
