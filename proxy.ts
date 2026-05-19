import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher(['/', '/login(.*)', '/signup(.*)'])

export default clerkMiddleware(async (auth, req) => {
    const { userId } = await auth();
    if(!userId && !isPublicRoute(req)) {
        return NextResponse.redirect(new URL("/login", req.url));
    }
    if(userId && isPublicRoute(req)) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
    // Always run for Clerk-specific frontend API routes
    '/__clerk/(.*)',
  ],
}