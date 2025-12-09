import { NextResponse } from 'next/server';

// NOTE: Temporarily disable server-side auth middleware because Supabase getUser/getSession is timing out on production.
// Client-side guards remain in place (AuthContext + page-level redirects).
export function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
