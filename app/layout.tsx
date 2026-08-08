import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/hooks/use-cart";
import { CompareProvider } from "@/hooks/use-compare";
import { DemoProvider } from "@/hooks/use-demo";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileNav } from "@/components/layout/mobile-nav";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Shop-O-Holics | Immersive Luxury Showroom",
    template: "%s | Shop-O-Holics",
  },
  description:
    "Experience Crimson Luxe high-performance titanium smartphones, laptops, audio, and wearables crafted with Apple-standard precision.",
  keywords: [
    "Luxury Electronics",
    "Apex Smartphone Pro",
    "HyperBook Ultra 16",
    "Titanium Hardware",
    "Crimson Luxe",
    "AeroBuds Studio Max",
  ],
  authors: [{ name: "Shop-O-Holics" }],
  openGraph: {
    title: "Shop-O-Holics | Luxury Electronics Retail",
    description:
      "Precision-engineered titanium hardware and high-performance mobile devices.",
    url: "https://shop-o-holics.com",
    siteName: "Shop-O-Holics",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased min-h-screen flex flex-col justify-between">
        <DemoProvider>
          <CartProvider>
            <CompareProvider>
              <Header />
              <main className="flex-1 pt-[72px] sm:pt-[76px]">{children}</main>
              <Footer />
              <MobileNav />
            </CompareProvider>
          </CartProvider>
        </DemoProvider>
      </body>
    </html>
  );
}
