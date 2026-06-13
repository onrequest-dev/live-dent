
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// import RemoveContextMenu from "@/components/removeContexetMenu";
import Backgroundjob from "@/components/backgroundjob";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "live-dent",
  description:
    "نظام رقمي متكامل يدير جميع جوانب عيادة الأسنان بكل احترافية وسهولة",
  other: {
    google: "notranslate",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icon-180x180.png" />
      </head>
      <body className={inter.className}>
        {children}
        <Backgroundjob />
        {/* <RemoveContextMenu /> */}
      </body>
    </html>
  );
}
