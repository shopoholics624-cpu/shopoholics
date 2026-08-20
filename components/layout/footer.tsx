"use client";

import { DemoLink as Link } from "@/components/demo/demo-link";
import {
  Info,
  User,
  PhoneCall,
  MapPin,
  Mail,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import { useDemo } from "@/hooks/use-demo";

export function Footer() {
  const { handleDemoAction } = useDemo();

  return (
    <footer className="w-full bg-[#0b0e14] text-slate-300 pt-14 pb-24 md:pb-14 border-t border-[#1b2333]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Top 4-Column Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Column 1: Brand, Subscribe & Socials */}
          <div className="lg:col-span-4 space-y-5">
            <Link href="/" className="inline-flex items-center group">
              <div className="bg-white px-3.5 py-2 rounded-2xl border border-white/30 shadow-md inline-flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg">
                {/* eslint-disable-next-img-element */}
                <img
                  src="/images/logo-cropped.png"
                  alt="Shop-O-Holics - Spend Less, Save More... Shop Smart!!!"
                  className="h-7 sm:h-8 max-w-[150px] sm:max-w-[180px] w-auto object-contain"
                />
              </div>
            </Link>

            <p className="text-xs text-slate-400 leading-relaxed font-medium max-w-sm">
              Your ultimate destination for premium tech. Discover the latest products, exclusive deals and flagship performance.
            </p>

            <div className="w-8 h-0.5 bg-[#e51937] rounded-full" />

            {/* Follow Us Socials */}
            <div className="space-y-2 pt-1">
              <span className="text-xs font-black text-white uppercase tracking-wider block">
                FOLLOW US
              </span>
              <div className="flex items-center gap-2.5">
                {/* Facebook */}
                <a
                  href="https://www.facebook.com/techshopoholics"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-[#131924] hover:bg-[#e51937] border border-[#212c40] text-slate-300 hover:text-white flex items-center justify-center transition-all shadow-sm hover:scale-105"
                  aria-label="Facebook"
                  title="Follow us on Facebook"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>

                {/* Instagram */}
                <a
                  href="https://www.instagram.com/techshopoholics"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-[#131924] hover:bg-[#e51937] border border-[#212c40] text-slate-300 hover:text-white flex items-center justify-center transition-all shadow-sm hover:scale-105"
                  aria-label="Instagram"
                  title="Follow us on Instagram"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>

                {/* Threads */}
                <a
                  href="https://www.threads.com/techshopoholics"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-[#131924] hover:bg-[#e51937] border border-[#212c40] text-slate-300 hover:text-white flex items-center justify-center transition-all shadow-sm hover:scale-105"
                  aria-label="Threads"
                  title="Follow us on Threads"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 192 192">
                    <path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4484 44.7443 97.3355 44.7443 97.222 44.745C75.2429 44.745 58.7303 59.9839 56.4024 82.3551C53.7915 107.429 70.8358 128.694 94.6192 130.126C107.411 130.896 119.839 126.963 128.878 119.333L119.646 108.577C112.923 114.28 103.712 117.202 93.9669 116.619C78.4357 115.688 67.2415 101.815 68.966 85.2282C70.478 70.6798 81.9961 59.8774 97.222 59.8774C97.3005 59.8774 97.379 59.8774 97.4568 59.8781C113.882 59.9832 123.639 70.2198 124.639 88.898C117.432 87.9719 109.845 88.1678 102.327 89.4795C78.5085 93.6362 64.9142 107.253 66.8665 123.364C68.6105 137.756 81.3326 147.255 96.6579 147.255C116.143 147.255 128.468 135.834 133.454 119.825C139.735 127.671 148.647 132.894 159.206 133.528L160.038 120.528C152.052 120.048 145.419 115.748 141.537 108.988V88.9883ZM98.4118 132.378C89.0435 132.378 80.8931 127.348 79.7997 118.324C78.5054 107.643 87.7288 98.4891 104.382 95.583C109.317 94.7214 114.364 94.3986 119.349 94.6186C117.18 120.52 108.767 132.378 98.4118 132.378Z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: INFORMATION */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#1e141a] border border-[#3b1822] text-[#e51937] flex items-center justify-center shrink-0">
                <Info className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-black text-white uppercase tracking-wider">
                INFORMATION
              </h3>
            </div>

            <ul className="space-y-2">
              {(
                [
                  { label: "About Us", href: "/about" },
                  { label: "Privacy Policy", href: "/privacy-policy" },
                  { label: "Store Locations", href: "/store-locations" },
                  { label: "Returns & Refunds", href: "/returns-refunds" },
                  { label: "Contact Us", href: "/contact" },
                ] as Array<{ label: string; href?: string; action?: () => void }>
              ).map((item, idx) => (
                <li key={idx}>
                  {item.href ? (
                    <Link
                      href={item.href}
                      className="group flex items-center gap-2 text-xs text-slate-300 hover:text-white transition-colors py-0.5"
                    >
                      <span className="text-[#e51937] font-bold text-xs group-hover:translate-x-0.5 transition-transform">&gt;</span>
                      <span>{item.label}</span>
                    </Link>
                  ) : (
                    <button
                      onClick={item.action}
                      className="w-full group flex items-center gap-2 text-xs text-slate-300 hover:text-white transition-colors py-0.5 text-left"
                    >
                      <span className="text-[#e51937] font-bold text-xs group-hover:translate-x-0.5 transition-transform">&gt;</span>
                      <span>{item.label}</span>
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: MY ACCOUNT */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#1e141a] border border-[#3b1822] text-[#e51937] flex items-center justify-center shrink-0">
                <User className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-black text-white uppercase tracking-wider">
                MY ACCOUNT
              </h3>
            </div>

            <ul className="space-y-2">
              {[
                { label: "My Account", href: "/account/orders" },
                { label: "My Orders", href: "/account/orders" },
                { label: "Track Order", href: "/account/orders" },
                { label: "Logout", action: handleDemoAction },
              ].map((item, idx) => (
                <li key={idx}>
                  {item.href ? (
                    <Link
                      href={item.href}
                      className="group flex items-center gap-2 text-xs text-slate-300 hover:text-white transition-colors py-0.5"
                    >
                      <span className="text-[#e51937] font-bold text-xs group-hover:translate-x-0.5 transition-transform">&gt;</span>
                      <span>{item.label}</span>
                    </Link>
                  ) : (
                    <button
                      onClick={item.action}
                      className="w-full group flex items-center gap-2 text-xs text-slate-300 hover:text-white transition-colors py-0.5 text-left"
                    >
                      <span className="text-[#e51937] font-bold text-xs group-hover:translate-x-0.5 transition-transform">&gt;</span>
                      <span>{item.label}</span>
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: CONTACT INFO. */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#1e141a] border border-[#3b1822] text-[#e51937] flex items-center justify-center shrink-0">
                <PhoneCall className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-black text-white uppercase tracking-wider">
                CONTACT INFO.
              </h3>
            </div>

            <div className="bg-[#111622] border border-[#1f293b] rounded-2xl p-5 space-y-4 text-xs text-slate-300 shadow-sm">
              {/* Location with Always-Visible Clickable Google Map */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#24161c] border border-[#471a24] text-[#e51937] flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="space-y-2 w-full">
                  <span className="leading-relaxed block">
                    Shop D, 86, Audiappa Naicken Street, Sowcarpet, Chennai - 600001
                  </span>

                  {/* Clickable Google Map Container */}
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Shop+D,+86,+Audiappa+Naicken+Street,+Sowcarpet,+Chennai+-+600001"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full h-40 rounded-xl overflow-hidden border border-[#212c40] hover:border-[#e51937] shadow-md bg-[#131924] cursor-pointer transition-colors"
                    title="Click to open location in Google Maps"
                  >
                    <iframe
                      title="Store Google Map Location"
                      width="100%"
                      height="100%"
                      style={{ border: 0, pointerEvents: "none" }}
                      loading="lazy"
                      src="https://maps.google.com/maps?q=Shop+D,+86,+Audiappa+Naicken+Street,+Sowcarpet,+Chennai+-+600001&t=&z=15&ie=UTF8&iwloc=&output=embed"
                    />
                  </a>
                </div>
              </div>

              {/* Phone & Ask Expert */}
              <div className="flex items-start gap-3 pt-3 border-t border-[#1b2333]">
                <div className="w-8 h-8 rounded-full bg-[#24161c] border border-[#471a24] text-[#e51937] flex items-center justify-center shrink-0 mt-0.5">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <div>Toll Free: <span className="font-bold text-white">+91 44 4212 7800</span></div>
                  <div>Mobile: <span className="font-bold text-white">+91 988 422 0620</span></div>
                  <button
                    onClick={handleDemoAction}
                    className="mt-1 px-4 py-1.5 rounded-full bg-[#e51937] hover:bg-[#c4122d] text-white text-[10px] font-extrabold uppercase tracking-wider inline-flex items-center gap-1.5 transition-all shadow-md"
                  >
                    <span>ASK AN EXPERT</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-3 pt-3 border-t border-[#1b2333]">
                <div className="w-8 h-8 rounded-full bg-[#24161c] border border-[#471a24] text-[#e51937] flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <a
                  href="mailto:support@shopoholics.in"
                  className="font-semibold text-slate-200 hover:text-white transition-colors"
                >
                  support@shopoholics.in
                </a>
              </div>

              {/* Operating Hours */}
              <div className="flex items-start gap-3 pt-3 border-t border-[#1b2333]">
                <div className="w-8 h-8 rounded-full bg-[#24161c] border border-[#471a24] text-[#e51937] flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <div>Mon - Sat: <span className="font-bold text-white">10:30 AM - 8:00 PM</span></div>
                  <div className="text-[#e51937] font-bold">Sun: Closed</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-4 border-t border-[#1b2333] flex items-center justify-center sm:justify-start text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Shop-O-Holics. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
