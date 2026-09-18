
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'


export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const jwt = request.cookies.get('jwt')?.value
//   console.log(jwt)
  const adminToken = request.cookies.get('admin_token')?.value

  // ============================================================
  // ✅ حماية مسارات المدير
  // ============================================================
  if (pathname.startsWith('/admin')) {
    // صفحة تسجيل دخول المدير مفتوحة
    if (pathname === '/admin/login') {
      // إذا كان مسجل دخول بالفعل → حوّله للداشبورد
      if (adminToken && adminToken === process.env.ADMIN_TOKEN) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url))
      }
      return NextResponse.next()
    }

    // التحقق من الكوكي
    if (!adminToken || adminToken !== process.env.ADMIN_TOKEN) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    return NextResponse.next()
  }
  // السماح بالوصول للمسارات المفتوحة للجميع
  if(pathname === '/landing-page') {
    // إنشاء URL جديد مع الحفاظ على query parameters
    const newUrl = new URL('/', request.url)
    // نسخ جميع query parameters من الرابط الأصلي
    request.nextUrl.searchParams.forEach((value, key) => {
      newUrl.searchParams.set(key, value)
    })
    return NextResponse.rewrite(newUrl)
  }

    
  if (pathname === '/' && jwt) {
    const suspended = request.cookies.get('suspended')?.value
    if(suspended) return NextResponse.redirect(new URL('/suspended', request.url))
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