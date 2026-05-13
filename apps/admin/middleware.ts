import { getInjection } from "@repo/core/types";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if(pathname.startsWith('/api')) {
        return NextResponse.next({request});
    }

    try {
        const authService = await getInjection('IAuthenticationService');
        const { user, response } = await authService.updateSession(request);
        //console.log('user', user);

        if(!user && !pathname.startsWith('/sign-in')) {
            console.log('redirecting to sign-in case no user');
            return NextResponse.redirect(new URL('/sign-in', request.url));
        } else if(user && user.user_role.includes('admin') && pathname.startsWith('/sign-in')) {
            console.log('redirecting to dashboard');
            return NextResponse.redirect(new URL('/dashboard', request.url));
        } else if(user && !user.user_role.includes('admin') && !pathname.startsWith('/sign-in')) {
            console.log('redirecting to sign-in case not admin');
            return NextResponse.redirect(new URL('/sign-in', request.url)); 
        } 

        return response;

    } catch(error) {
        console.error(error);
        if(!pathname.startsWith('/sign-in')) {
            return NextResponse.redirect(new URL('/sign-in', request.url));
        }

        return NextResponse.next({request});
    }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
