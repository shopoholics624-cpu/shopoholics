"use client";

import { DemoLink as Link } from "@/components/demo/demo-link";
import { ShieldCheck, Truck, RotateCcw, Headphones, ArrowRight } from "lucide-react";
import { useDemo } from "@/hooks/use-demo";

export function Footer() {
  const { handleDemoAction } = useDemo();

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleDemoAction(e);
  };

  return (
    <footer className="bg-[#3d2c2a] text-[#fff8f6] pt-16 pb-24 md:pb-16 border-t border-[#8e706b]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Value Props Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-12 border-b border-[#8e706b]/20">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-[#8b0000] text-white rounded-2xl shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-base">2-Year Elite Warranty</h4>
              <p className="text-xs text-[#e3beb8] mt-1">Full coverage on titanium build & battery health.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-[#8b0000] text-white rounded-2xl shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-base">Complimentary Delivery</h4>
              <p className="text-xs text-[#e3beb8] mt-1">Express insured courier on orders over $1,000.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-[#8b0000] text-white rounded-2xl shrink-0">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-base">30-Day Unboxing Guarantee</h4>
              <p className="text-xs text-[#e3beb8] mt-1">Hassle-free luxury return & exchange window.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-[#8b0000] text-white rounded-2xl shrink-0">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-base">Concierge 24/7 Support</h4>
              <p className="text-xs text-[#e3beb8] mt-1">Direct access to hardware specialists.</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links & Newsletter */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Brand Col */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#8b0000] to-[#e51c10] flex items-center justify-center text-white font-bold text-base">
                S
              </div>
              <span className="font-bold text-xl tracking-tight text-white">
                Shop-O-Holics
              </span>
            </div>
            <p className="text-xs text-[#e3beb8] leading-relaxed pr-4">
              Where high-performance hardware meets Scandinavian luxury minimalism. Engineered for those who appreciate fine craftsmanship in technology.
            </p>
            <div className="pt-2">
              <span className="text-[11px] font-semibold text-[#ff907f] tracking-wider uppercase">
                Crimson Luxe Collection
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-2 space-y-3">
            <h5 className="font-semibold text-white text-sm">Shop Flagships</h5>
            <ul className="space-y-2 text-xs text-[#e3beb8]">
              <li><Link href="/products/flagship-smartphone-pro" className="hover:text-white transition-colors">Apex Smartphone Pro</Link></li>
              <li><Link href="/products/hyperbook-ultra-16" className="hover:text-white transition-colors">HyperBook Ultra 16</Link></li>
              <li><Link href="/products/aero-buds-studio" className="hover:text-white transition-colors">AeroBuds Studio Max</Link></li>
              <li><Link href="/products/chronos-titanium-watch" className="hover:text-white transition-colors">Chronos Ultra Watch</Link></li>
            </ul>
          </div>

          {/* Tools & Account */}
          <div className="md:col-span-2 space-y-3">
            <h5 className="font-semibold text-white text-sm">Customer Care</h5>
            <ul className="space-y-2 text-xs text-[#e3beb8]">
              <li><Link href="/compare" className="hover:text-white transition-colors">Compare Hardware</Link></li>
              <li><Link href="/account/orders" className="hover:text-white transition-colors">Live Order Tracking</Link></li>
              <li><Link href="/cart" className="hover:text-white transition-colors">Your Bag</Link></li>
              <li><Link href="/checkout/shipping" className="hover:text-white transition-colors">Shipping & Customs</Link></li>
            </ul>
          </div>

          {/* Newsletter Subscription */}
          <div className="md:col-span-4 space-y-4">
            <h5 className="font-semibold text-white text-sm">Elite Circle Insider</h5>
            <p className="text-xs text-[#e3beb8]">
              Subscribe for private key releases, hardware keynote invitations, and custom luxury finishes.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex items-center gap-2">
              <input
                type="email"
                placeholder="Enter corporate email"
                className="w-full px-4 py-2.5 rounded-xl bg-[#261816] text-white placeholder:text-[#8e706b] text-xs border border-[#8e706b]/40 focus:outline-none focus:border-[#e51c10]"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-[#8b0000] hover:bg-[#e51c10] text-white text-xs font-semibold shrink-0 transition-colors flex items-center gap-1"
              >
                <span>Join</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 border-t border-[#8e706b]/20 flex flex-col sm:flex-row items-center justify-between text-xs text-[#8e706b]">
          <p>© {new Date().getFullYear()} Shop-O-Holics Core Design System. All rights reserved.</p>
          <div className="flex gap-6 mt-4 sm:mt-0">
            <button onClick={handleDemoAction} className="hover:text-[#e3beb8] cursor-pointer">Privacy Policy</button>
            <button onClick={handleDemoAction} className="hover:text-[#e3beb8] cursor-pointer">Terms of Service</button>
            <button onClick={handleDemoAction} className="hover:text-[#e3beb8] cursor-pointer">Hardware Diagnostics</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
