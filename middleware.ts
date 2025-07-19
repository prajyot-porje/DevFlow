import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const { pathname } = req.nextUrl;
  if (pathname === '/sign-in' || pathname === '/sign-up' || pathname ==='/') {
    return NextResponse.next();
  }
  if (pathname === '/chat' && !userId) {
    const signInUrl = new URL('/sign-in', req.nextUrl.origin);
    signInUrl.searchParams.set('returnBackUrl', '/');
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|sign-in|sign-up|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};