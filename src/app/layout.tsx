import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import { preconnect, prefetchDNS } from "react-dom";
import { CartProvider } from "@/context/CartContext";
import "./globals.css";

// BRANDING_TODO: Configure/Replace primary typography and font family for the storefront.
const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["400", "500", "700"],
  variable: "--font-tajawal",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://mediumpurple-tarsier-577339.hostingersite.com"),
  title: {
    template: "%s | متجر نيكوتين الكويت",
    default: "متجر نيكوتين الكويت",
  },
  description:
    "نيكوتين هو مصدرك الموثوق لمنتجات الفيب بالكويت، الحين تقدر تشتري جميع أغراض الفيب من مكان واحد بأرخص الاسعار وبتوصيل مجاني داخل الكويت",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    siteName: "متجر نيكوتين الكويت",
    locale: "ar_KW",
    type: "website",
    description:
      "نيكوتين هو مصدرك الموثوق لمنتجات الفيب بالكويت، الحين تقدر تشتري جميع أغراض الفيب من مكان واحد بأرخص الاسعار وبتوصيل مجاني داخل الكويت",
  },
  twitter: {
    card: "summary_large_image",
    description:
      "نيكوتين هو مصدرك الموثوق لمنتجات الفيب بالكويت، الحين تقدر تشتري جميع أغراض الفيب من مكان واحد بأرخص الاسعار وبتوصيل مجاني داخل الكويت",
  },
  icons: {
    icon: "/nicotine-logo.webp",
    apple: "/nicotine-logo.webp",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  preconnect("https://aliceblue-gnu-460662.hostingersite.com");
  prefetchDNS("https://aliceblue-gnu-460662.hostingersite.com");

  return (
    <html lang="ar" dir="rtl" className={tajawal.variable}>
      <body>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
