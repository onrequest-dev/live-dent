import type { MetadataRoute } from 'next'
import { cookies } from 'next/headers';
 
export const dynamic = 'force-dynamic';

export default async function manifest(): Promise<MetadataRoute.Manifest> {
    const cookieStore = cookies();
    const primary_color = cookieStore.get('primary_color')?.value || "#b08b46";
    const secondary_color = cookieStore.get('secondary_color')?.value || "#00305f";
  return {
    name: 'Live-dent',
    short_name: 'Live-dent',
    description: "نظام رقمي متكامل يدير جميع جوانب عيادة الأسنان بكل احترافية وسهولة",
    start_url: '/',
    display: 'standalone',
    background_color: secondary_color,
    theme_color: primary_color,
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}