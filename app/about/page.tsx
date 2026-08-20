import type { Metadata } from "next";
import { Truck, Globe, CheckCircle2, ShieldCheck, HeartHandshake, Sparkles } from "lucide-react";
import { Breadcrumbs } from "@/components/common/breadcrumbs";

export const metadata: Metadata = {
  title: "About Us | Shop-O-Holics",
  description:
    "Learn more about Shop-O-Holics, our commitment to cutting-edge electronics, free shipping, 24/7 support, and 100% quality guarantee.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Top Header & Breadcrumbs Banner */}
      <div className="bg-[#fff9f8] border-b border-[#ffe9e6] py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3 text-center sm:text-left">
          <Breadcrumbs items={[{ label: "About Us" }]} />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#261816] tracking-tight">
              About Us
            </h1>
            <span className="text-xs font-bold text-[#8b0000] uppercase tracking-widest bg-[#ffe9e6] px-3.5 py-1 rounded-full w-fit mx-auto sm:mx-0 border border-[#f8dcd8]">
              Spend Less, Save More... Shop Smart!!!
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          
          {/* Left Column: What Service We Offer */}
          <div className="lg:col-span-4 bg-[#fff9f8] border border-[#ffe9e6] rounded-3xl p-6 sm:p-8 flex flex-col justify-center space-y-5 shadow-sm">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#ffe9e6] text-[#8b0000] flex items-center justify-center border border-[#f8dcd8]">
                <Sparkles className="w-5 h-5" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#261816] leading-tight tracking-tight">
                What Service We Offer For Our Customers?
              </h2>
              <div className="w-12 h-1 bg-[#e51937] rounded-full" />
            </div>

            <p className="text-sm text-[#5a403c] leading-relaxed font-normal">
              At Shop-O-Holics, we&apos;re passionate about bringing you the latest and greatest in gadgets and electronics. From cutting-edge smartphones and sleek televisions to energy-efficient air conditioners and smart home devices, we&apos;ve got everything you need to elevate your lifestyle. Our mission is to offer high-quality products at competitive prices, backed by exceptional customer service. Whether you&apos;re upgrading your tech or creating the ultimate smart home, Shop-O-Holics is your one-stop destination for all things electronic.
            </p>
          </div>

          {/* Right Column: 3 Feature Cards */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
            {/* Card 1: Free Shipping */}
            <div className="bg-[#0b0e14] border border-[#1b2333] hover:border-[#e51937]/60 rounded-3xl p-6 sm:p-7 flex flex-col text-center items-center justify-between transition-all duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-1 group">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-[#131924] border border-[#212c40] text-slate-200 group-hover:text-white group-hover:bg-[#e51937] group-hover:border-[#e51937] flex items-center justify-center transition-all duration-300 shadow-md">
                  <Truck className="w-7 h-7" />
                </div>
                <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
                  FREE SHIPPING
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  At Shop-O-Holics, we believe in making your shopping experience as hassle-free as possible. That&apos;s why we&apos;re offering FREE shipping on all orders over ₹999! Whether you&apos;re picking up the latest smartphone, a new smart home gadget, or upgrading your TV, we&apos;ll deliver it right to your doorstep at no extra cost. Shop more, save more, and get your favorite electronics with ease—because at Shop-O-Holics, we&apos;ve got you covered!
                </p>
              </div>
            </div>

            {/* Card 2: 24/7 Support */}
            <div className="bg-[#0b0e14] border border-[#1b2333] hover:border-[#e51937]/60 rounded-3xl p-6 sm:p-7 flex flex-col text-center items-center justify-between transition-all duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-1 group">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-[#131924] border border-[#212c40] text-slate-200 group-hover:text-white group-hover:bg-[#e51937] group-hover:border-[#e51937] flex items-center justify-center transition-all duration-300 shadow-md">
                  <Globe className="w-7 h-7" />
                </div>
                <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
                  24/7 SUPPORT
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  We&apos;re committed to providing you with the best shopping experience. Hence, we offer 24/7 customer support to assist you anytime, day or night. Whether you have a question, need help with a product, or need post-purchase support, our team is always ready to ensure you&apos;re completely satisfied. Shop with peace of mind, we&apos;re here for you around the clock! No matter the issue, we&apos;re just a call or message away.
                </p>
              </div>
            </div>

            {/* Card 3: 100% Quality */}
            <div className="bg-[#0b0e14] border border-[#1b2333] hover:border-[#e51937]/60 rounded-3xl p-6 sm:p-7 flex flex-col text-center items-center justify-between transition-all duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-1 group">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-[#131924] border border-[#212c40] text-slate-200 group-hover:text-white group-hover:bg-[#e51937] group-hover:border-[#e51937] flex items-center justify-center transition-all duration-300 shadow-md">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
                  100% QUALITY
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  We believe in offering nothing but the best. That&apos;s why every product we sell is backed by our 100% quality guarantee. Whether you&apos;re upgrading your tech or transforming your home, rest assured that every product is designed to exceed your expectations. Shop with confidence, knowing that every purchase is crafted to deliver top-notch quality—because at Shop-O-Holics, we never compromise on excellence!
                </p>
                <span className="text-[11px] font-bold text-[#e51937] block pt-1">
                  #Spend Less...Save more....
                </span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
