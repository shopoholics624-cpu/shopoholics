import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Navigation,
  ExternalLink,
  Store,
  ShieldCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Store Locations | Shop-O-Holics",
  description:
    "Find our flagship retail store in Chennai. Visit Shop-O-Holics at Sowcarpet for luxury smartphones, electronics, and expert support.",
};

export default function StoreLocationsPage() {
  const storeAddress = "Shop D, 86, Audiappa Naicken Street, Sowcarpet, Chennai - 600001";
  const googleMapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    storeAddress
  )}`;
  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    storeAddress
  )}`;
  const embedMapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
    storeAddress
  )}&t=&z=16&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="min-h-screen bg-white">
      {/* Top Header & Breadcrumbs Banner */}
      <div className="bg-[#fff9f8] border-b border-[#ffe9e6] py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3 text-center sm:text-left">
          <Breadcrumbs items={[{ label: "Store Locations" }]} />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#261816] tracking-tight">
              Store Locations
            </h1>
            <span className="text-xs font-bold text-[#8b0000] uppercase tracking-widest bg-[#ffe9e6] px-3.5 py-1 rounded-full w-fit mx-auto sm:mx-0 border border-[#f8dcd8]">
              Flagship Retail Store
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* Left Column: Store Details & Actions */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#fff9f8] border border-[#ffe9e6] rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-2xl bg-[#ffe9e6] text-[#8b0000] flex items-center justify-center border border-[#f8dcd8]">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-extrabold text-[#8b0000] uppercase tracking-wider block">
                      Chennai Flagship
                    </span>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-[#261816] tracking-tight">
                      Shop-O-Holics
                    </h2>
                  </div>
                </div>
                <div className="w-12 h-1 bg-[#e51937] rounded-full" />
              </div>

              {/* Address */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#ffe9e6] text-[#8b0000] flex items-center justify-center shrink-0 mt-0.5 border border-[#f8dcd8]">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-extrabold text-[#8b0000] uppercase tracking-wider block">
                    ADDRESS
                  </span>
                  <p className="text-sm font-medium text-[#261816] leading-relaxed">
                    {storeAddress}
                  </p>
                </div>
              </div>

              {/* Contact Numbers */}
              <div className="flex items-start gap-3 pt-3 border-t border-[#ffe9e6]">
                <div className="w-9 h-9 rounded-xl bg-[#ffe9e6] text-[#8b0000] flex items-center justify-center shrink-0 mt-0.5 border border-[#f8dcd8]">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-extrabold text-[#8b0000] uppercase tracking-wider block">
                    CONTACT NUMBER
                  </span>
                  <div className="text-sm text-[#261816] space-y-0.5">
                    <div>Toll Free: <strong className="font-bold">+91 44 4212 7800</strong></div>
                    <div>Mobile: <strong className="font-bold">+91 988 422 0620</strong></div>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3 pt-3 border-t border-[#ffe9e6]">
                <div className="w-9 h-9 rounded-xl bg-[#ffe9e6] text-[#8b0000] flex items-center justify-center shrink-0 mt-0.5 border border-[#f8dcd8]">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-extrabold text-[#8b0000] uppercase tracking-wider block">
                    EMAIL ADDRESS
                  </span>
                  <a
                    href="mailto:support@shopoholics.in"
                    className="text-sm font-semibold text-[#8b0000] hover:underline block"
                  >
                    support@shopoholics.in
                  </a>
                </div>
              </div>

              {/* Working Hours */}
              <div className="flex items-start gap-3 pt-3 border-t border-[#ffe9e6]">
                <div className="w-9 h-9 rounded-xl bg-[#ffe9e6] text-[#8b0000] flex items-center justify-center shrink-0 mt-0.5 border border-[#f8dcd8]">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-extrabold text-[#8b0000] uppercase tracking-wider block">
                    OPENING HOURS
                  </span>
                  <div className="text-xs sm:text-sm text-[#261816] space-y-0.5">
                    <div>Monday - Saturday: <strong className="font-bold">10:30 AM - 8:00 PM</strong></div>
                    <div className="text-[#e51937] font-bold">Sunday: Closed</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <a
                  href={googleMapsDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-5 py-3.5 rounded-xl bg-[#8b0000] hover:bg-[#bc0000] text-white text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Get Directions</span>
                </a>

                <a
                  href={googleMapsSearchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3.5 rounded-xl bg-white border border-[#e3beb8] hover:border-[#8b0000] text-[#8b0000] text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open Maps</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Embedded Google Map */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-[#0b0e14] border border-[#1f293b] rounded-3xl p-3 sm:p-4 shadow-xl overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 text-xs text-slate-300 border-b border-[#1b2333] mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#e51937] animate-pulse" />
                  <span className="font-bold text-white uppercase tracking-wider text-[11px]">
                    Live Google Map
                  </span>
                </div>
                <a
                  href={googleMapsSearchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                >
                  <span>Full View</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Iframe Google Map */}
              <div className="w-full h-[420px] sm:h-[480px] rounded-2xl overflow-hidden border border-[#212c40] bg-[#131924]">
                <iframe
                  title="Shop-O-Holics Store Location - Sowcarpet, Chennai"
                  src={embedMapUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
