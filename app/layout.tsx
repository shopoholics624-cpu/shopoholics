import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/hooks/use-cart";
import { CompareProvider } from "@/hooks/use-compare";
import { DemoProvider } from "@/hooks/use-demo";
import { WishlistProvider } from "@/hooks/use-wishlist";
import { AuthProvider } from "@/hooks/use-auth";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileNav } from "@/components/layout/mobile-nav";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Shop-O-Holics | Luxury Flagship Electronics",
  description: "Shop-O-Holics - Premium store for smartphones, laptops, audio, and flagship tech.",
  openGraph: {
    title: "Shop-O-Holics | Luxury Flagship Electronics",
    description: "Shop-O-Holics - Premium store for smartphones, laptops, audio, and flagship tech.",
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
      <body className={`${inter.className} antialiased min-h-screen flex flex-col justify-between`}>
        <DemoProvider>
          <AuthProvider>
            <WishlistProvider>
              <CartProvider>
                <CompareProvider>
                  <Header />
                  <main className="flex-1">{children}</main>
                  <Footer />
                  <MobileNav />
                </CompareProvider>
              </CartProvider>
            </WishlistProvider>
          </AuthProvider>
        </DemoProvider>
      </body>
    </html>
  );
}
