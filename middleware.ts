
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'


export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const jwt = request.cookies.get('jwt')?.value
//   console.log(jwt)

  // السماح بالوصول للمسارات المفتوحة للجميع
  if(pathname === '/landing-page') return NextResponse.rewrite(new URL('/', request.url))
    
  if (pathname === '/' && jwt) {
    const clinicId = request.cookies.get('clinic_id')?.value
    if(!clinicId) return NextResponse.redirect(new URL('/log-in', request.url))
    return NextResponse.redirect(new URL(`/dashboard/${clinicId}`, request.url))
  }
  const openPaths = ['/',  '/log-in', '/privacy-and-terms']
  if (openPaths.includes(pathname)) {
    return NextResponse.next()
  }
  if(!jwt&& pathname.startsWith('/dashboard')){
    return NextResponse.rewrite(new URL('/404', request.url))
  }
  // التحقق من المسارات الخاصة بالمسؤول
  

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
