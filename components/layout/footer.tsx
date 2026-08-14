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
              {/* eslint-disable-next-img-element */}
              <img
                src="/images/logo-cropped.png"
                alt="Shop-O-Holics - Spend Less, Save More... Shop Smart!!!"
                className="h-8 sm:h-9 max-w-[160px] sm:max-w-[190px] w-auto object-contain transition-transform group-hover:scale-105"
              />
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
              <div className="flex items-center gap-2">
                {/* Facebook */}
                <button
                  onClick={handleDemoAction}
                  className="w-9 h-9 rounded-full bg-[#131924] hover:bg-[#e51937] border border-[#212c40] text-slate-300 hover:text-white flex items-center justify-center transition-all shadow-sm hover:scale-105"
                  aria-label="Facebook"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </button>
                {/* X */}
                <button
                  onClick={handleDemoAction}
                  className="w-9 h-9 rounded-full bg-[#131924] hover:bg-[#e51937] border border-[#212c40] text-slate-300 hover:text-white flex items-center justify-center transition-all shadow-sm hover:scale-105"
                  aria-label="X (Twitter)"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </button>
                {/* Instagram */}
                <button
                  onClick={handleDemoAction}
                  className="w-9 h-9 rounded-full bg-[#131924] hover:bg-[#e51937] border border-[#212c40] text-slate-300 hover:text-white flex items-center justify-center transition-all shadow-sm hover:scale-105"
                  aria-label="Instagram"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </button>
                {/* YouTube */}
                <button
                  onClick={handleDemoAction}
                  className="w-9 h-9 rounded-full bg-[#131924] hover:bg-[#e51937] border border-[#212c40] text-slate-300 hover:text-white flex items-center justify-center transition-all shadow-sm hover:scale-105"
                  aria-label="YouTube"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </button>
                {/* WhatsApp */}
                <button
                  onClick={handleDemoAction}
                  className="w-9 h-9 rounded-full bg-[#131924] hover:bg-[#e51937] border border-[#212c40] text-slate-300 hover:text-white flex items-center justify-center transition-all shadow-sm hover:scale-105"
                  aria-label="WhatsApp"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                </button>
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
              {[
                { label: "About Us", action: handleDemoAction },
                { label: "Delivery Information", action: handleDemoAction },
                { label: "Privacy Policy", action: handleDemoAction },
                { label: "Terms & Conditions", action: handleDemoAction },
                { label: "Store Locations", action: handleDemoAction },
                { label: "Order History", href: "/account/orders" },
                { label: "Returns & Refunds", action: handleDemoAction },
                { label: "Contact Us", action: handleDemoAction },
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
