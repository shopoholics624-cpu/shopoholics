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
    <footer className="bg-[#181816] text-[#D4D3CD] pt-16 pb-24 md:pb-16 border-t border-[#D4D3CD]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Value Props Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-12 border-b border-[#D4D3CD]/20">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-[#8b0000] text-white rounded-2xl shrink-0 shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-[#D4D3CD] text-base">2-Year Official Warranty</h4>
              <p className="text-xs text-[#D4D3CD]/70 mt-1">Full coverage on titanium build & battery health.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-[#8b0000] text-white rounded-2xl shrink-0 shadow-md">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-[#D4D3CD] text-base">Complimentary Delivery</h4>
              <p className="text-xs text-[#D4D3CD]/70 mt-1">Express insured courier on orders over $1,000.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-[#8b0000] text-white rounded-2xl shrink-0 shadow-md">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-[#D4D3CD] text-base">30-Day Unboxing Guarantee</h4>
              <p className="text-xs text-[#D4D3CD]/70 mt-1">Hassle-free luxury return & exchange window.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-[#8b0000] text-white rounded-2xl shrink-0 shadow-md">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-[#D4D3CD] text-base">Concierge 24/7 Support</h4>
              <p className="text-xs text-[#D4D3CD]/70 mt-1">Direct access to hardware specialists.</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links & Newsletter */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Brand Col */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#8b0000] to-[#e51c10] flex items-center justify-center text-white font-bold text-base shadow-md">
                S
              </div>
              <span className="font-bold text-xl tracking-tight text-[#D4D3CD]">
                Shop-O-Holics
              </span>
            </div>
            <p className="text-xs text-[#D4D3CD]/80 leading-relaxed pr-4">
              Where high-performance hardware meets Scandinavian luxury minimalism. Engineered for those who appreciate fine craftsmanship in technology.
            </p>
            <div className="pt-2">
              <span className="text-[11px] font-semibold text-[#D4D3CD] tracking-wider uppercase bg-[#2A2926] px-2.5 py-1 rounded-full border border-[#D4D3CD]/30">
                Crimson Luxe Collection
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-2 space-y-3">
            <h5 className="font-bold text-[#D4D3CD] text-sm">Shop Flagships</h5>
            <ul className="space-y-2 text-xs text-[#D4D3CD]/80">
              <li><Link href="/products/flagship-smartphone-pro" className="hover:text-white transition-colors">Apex Smartphone Pro</Link></li>
              <li><Link href="/products/hyperbook-ultra-16" className="hover:text-white transition-colors">HyperBook Ultra 16</Link></li>
              <li><Link href="/products/aero-buds-studio" className="hover:text-white transition-colors">AeroBuds Studio Max</Link></li>
              <li><Link href="/products/chronos-titanium-watch" className="hover:text-white transition-colors">Chronos Ultra Watch</Link></li>
            </ul>
          </div>

          {/* Tools & Account */}
          <div className="md:col-span-2 space-y-3">
            <h5 className="font-bold text-[#D4D3CD] text-sm">Customer Care</h5>
            <ul className="space-y-2 text-xs text-[#D4D3CD]/80">
              <li><Link href="/compare" className="hover:text-white transition-colors">Compare Hardware</Link></li>
              <li><Link href="/account/orders" className="hover:text-white transition-colors">Live Order Tracking</Link></li>
              <li><Link href="/cart" className="hover:text-white transition-colors">Your Bag</Link></li>
              <li><Link href="/checkout/shipping" className="hover:text-white transition-colors">Shipping & Customs</Link></li>
            </ul>
          </div>

          {/* Newsletter Subscription */}
          <div className="md:col-span-4 space-y-4">
            <h5 className="font-bold text-[#D4D3CD] text-sm">Hardware Insider</h5>
            <p className="text-xs text-[#D4D3CD]/80">
              Subscribe for private key releases, hardware keynote invitations, and custom luxury finishes.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex items-center gap-2">
              <input
                type="email"
                placeholder="Enter corporate email"
                className="w-full px-4 py-2.5 rounded-xl bg-[#2A2926] text-[#D4D3CD] placeholder:text-[#D4D3CD]/50 text-xs border border-[#D4D3CD]/30 focus:outline-none focus:border-[#D4D3CD]"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-[#8b0000] hover:bg-[#bc0000] text-white text-xs font-semibold shrink-0 transition-colors flex items-center gap-1 min-h-[44px] shadow-md"
              >
                <span>Join</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 border-t border-[#D4D3CD]/20 flex flex-col sm:flex-row items-center justify-between text-xs text-[#D4D3CD]/70">
          <p>© {new Date().getFullYear()} Shop-O-Holics Core Design System. All rights reserved.</p>
          <div className="flex gap-6 mt-4 sm:mt-0">
            <button onClick={handleDemoAction} className="hover:text-white cursor-pointer transition-colors">Privacy Policy</button>
            <button onClick={handleDemoAction} className="hover:text-white cursor-pointer transition-colors">Terms of Service</button>
            <button onClick={handleDemoAction} className="hover:text-white cursor-pointer transition-colors">Hardware Diagnostics</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
