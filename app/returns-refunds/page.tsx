import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import {
  RotateCcw,
  CheckCircle2,
  XCircle,
  ClipboardList,
  CreditCard,
  ArrowLeftRight,
  ShieldCheck,
  Ban,
  Mail,
  Phone,
  MessageSquare,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Returns & Refunds Policy | Shop-O-Holics",
  description:
    "Learn about our 7-day return policy, eligibility criteria, refund timelines, exchanges, and warranty support at Shop-O-Holics.",
};

export default function ReturnsRefundsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Top Header & Breadcrumbs Banner */}
      <div className="bg-[#fff9f8] border-b border-[#ffe9e6] py-6 sm:py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3 text-center sm:text-left">
          <Breadcrumbs items={[{ label: "Returns & Refunds" }]} />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#261816] tracking-tight">
              Returns &amp; Refunds Policy
            </h1>
            <div className="flex items-center gap-2 text-xs font-bold text-[#8b0000] bg-[#ffe9e6] px-3.5 py-1.5 rounded-full border border-[#f8dcd8] w-fit mx-auto sm:mx-0">
              <RotateCcw className="w-3.5 h-3.5" />
              <span>7-Day Return Window</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Policy Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
        {/* Intro Hero Callout */}
        <div className="bg-[#fff9f8] border border-[#ffe9e6] rounded-3xl p-6 sm:p-8 space-y-2 text-[#261816] shadow-sm">
          <div className="flex items-center gap-2 text-[#8b0000] font-extrabold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Customer Satisfaction First</span>
          </div>
          <p className="text-sm sm:text-base text-[#5a403c] leading-relaxed">
            At <strong>Shop-O-Holics</strong>, we strive to ensure a smooth and satisfying shopping experience. If you’re not completely happy with your purchase, we’re here to help.
          </p>
        </div>

        {/* Section 1: Eligibility for Returns */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#ffe9e6] text-[#8b0000] flex items-center justify-center shrink-0 border border-[#f8dcd8]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#261816] tracking-tight">
              1. Eligibility for Returns
            </h2>
          </div>

          <div className="pl-0 sm:pl-12 space-y-3">
            <p className="text-sm text-[#5a403c]">You may request a return under the following conditions:</p>
            <ul className="space-y-2.5">
              {[
                "The item is damaged, defective, or not as described.",
                "The item is unused, with original packaging, accessories, manuals, and invoice.",
                "Return is requested within 7 days of delivery.",
                "For certain items like mobile phones, TVs, and ACs, a brand-authorized service center check may be required before return is approved.",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-xs sm:text-sm">
                  <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                    ✓
                  </div>
                  <span className="text-[#261816] font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <div className="w-full h-px bg-[#f0e6e4]" />

        {/* Section 2: Items Not Eligible for Return */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#ffe9e6] text-[#8b0000] flex items-center justify-center shrink-0 border border-[#f8dcd8]">
              <XCircle className="w-4 h-4" />
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#261816] tracking-tight">
              2. Items Not Eligible for Return
            </h2>
          </div>

          <div className="pl-0 sm:pl-12 space-y-3">
            <ul className="space-y-2.5">
              {[
                "Products that show signs of use, wear, or physical damage.",
                "Items without original packaging or accessories.",
                "Items returned after 7 days from delivery.",
                "Products under non-returnable category (clearly marked on product page).",
                "Damages due to improper usage, unauthorized repair, or neglect.",
                'Returns due to personal preferences, such as "no longer needed", "changed my mind", or "did not like the product", without any defect or issue.',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-xs sm:text-sm">
                  <div className="w-5 h-5 rounded-full bg-red-50 text-red-700 border border-red-200 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                    ✕
                  </div>
                  <span className="text-[#5a403c] font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <div className="w-full h-px bg-[#f0e6e4]" />

        {/* Section 3: How to Request a Return */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#ffe9e6] text-[#8b0000] flex items-center justify-center shrink-0 border border-[#f8dcd8]">
              <ClipboardList className="w-4 h-4" />
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#261816] tracking-tight">
              3. How to Request a Return
            </h2>
          </div>

          <div className="pl-0 sm:pl-12 space-y-3">
            <ol className="space-y-3">
              {[
                "Log in to your Shop-O-Holics account.",
                'Go to "My Orders", select the item you want to return.',
                'Click "Request Return" and follow the instructions.',
                "Upload images or videos (if applicable) showing the issue.",
                "Our support team will review your request and respond within 48 hours.",
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-xs sm:text-sm bg-[#fafafa] border border-[#f0e6e4] p-3.5 rounded-xl">
                  <span className="w-6 h-6 rounded-full bg-[#8b0000] text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-[#261816] font-medium pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <div className="w-full h-px bg-[#f0e6e4]" />

        {/* Section 4: Refunds */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#ffe9e6] text-[#8b0000] flex items-center justify-center shrink-0 border border-[#f8dcd8]">
              <CreditCard className="w-4 h-4" />
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#261816] tracking-tight">
              4. Refunds
            </h2>
          </div>

          <div className="pl-0 sm:pl-12 space-y-3 text-sm text-[#5a403c] leading-relaxed">
            <p>Once your return is approved and the item is received:</p>
            <ul className="space-y-2 pt-1">
              {[
                "A full refund will be issued to your original payment method within 5–7 business days.",
                "In case of Cash on Delivery (COD), refunds will be processed via bank transfer.",
                "You’ll receive a confirmation email once the refund is initiated.",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-xs sm:text-sm">
                  <div className="w-5 h-5 rounded-full bg-[#ffe9e6] text-[#8b0000] flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                    •
                  </div>
                  <span className="text-[#261816] font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <div className="w-full h-px bg-[#f0e6e4]" />

        {/* Section 5: Exchanges */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#ffe9e6] text-[#8b0000] flex items-center justify-center shrink-0 border border-[#f8dcd8]">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#261816] tracking-tight">
              5. Exchanges
            </h2>
          </div>

          <div className="pl-0 sm:pl-12 text-sm sm:text-base text-[#5a403c] leading-relaxed">
            <p>
              We currently do not offer direct exchanges. If you wish to exchange a product, you may return the original item (if eligible) and place a new order.
            </p>
          </div>
        </section>

        <div className="w-full h-px bg-[#f0e6e4]" />

        {/* Section 6: Warranty Claims */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#ffe9e6] text-[#8b0000] flex items-center justify-center shrink-0 border border-[#f8dcd8]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#261816] tracking-tight">
              6. Warranty Claims
            </h2>
          </div>

          <div className="pl-0 sm:pl-12 space-y-3 text-sm sm:text-base text-[#5a403c] leading-relaxed">
            <p>Many of our gadgets come with manufacturer warranties. For technical issues beyond the return window:</p>
            <ul className="space-y-2 pt-1">
              {[
                "Please contact the brand’s authorized service center.",
                "You may also reach out to us for guidance on warranty support.",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-xs sm:text-sm">
                  <div className="w-5 h-5 rounded-full bg-[#ffe9e6] text-[#8b0000] flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                    •
                  </div>
                  <span className="text-[#261816] font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <div className="w-full h-px bg-[#f0e6e4]" />

        {/* Section 7: Cancellations */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#ffe9e6] text-[#8b0000] flex items-center justify-center shrink-0 border border-[#f8dcd8]">
              <Ban className="w-4 h-4" />
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#261816] tracking-tight">
              7. Cancellations
            </h2>
          </div>

          <div className="pl-0 sm:pl-12 text-sm sm:text-base text-[#5a403c] leading-relaxed">
            <p>
              Orders can be cancelled before they are shipped. Once shipped, you’ll need to go through the return process.
            </p>
          </div>
        </section>

        <div className="w-full h-px bg-[#f0e6e4]" />

        {/* Section 8: Contact Us */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#ffe9e6] text-[#8b0000] flex items-center justify-center shrink-0 border border-[#f8dcd8]">
              <Mail className="w-4 h-4" />
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#261816] tracking-tight">
              8. Contact Us
            </h2>
          </div>

          <div className="pl-0 sm:pl-12 space-y-4">
            <p className="text-sm text-[#5a403c]">Still have questions? Our customer support is happy to help.</p>

            <div className="bg-[#fff9f8] border border-[#ffe9e6] rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-3 text-xs sm:text-sm">
                <Mail className="w-4 h-4 text-[#8b0000] shrink-0" />
                <span className="font-bold text-[#261816]">Email:</span>
                <a href="mailto:support@shopoholics.in" className="text-[#8b0000] hover:underline font-medium">
                  support@shopoholics.in
                </a>
              </div>

              <div className="flex items-center gap-3 text-xs sm:text-sm">
                <Phone className="w-4 h-4 text-[#8b0000] shrink-0" />
                <span className="font-bold text-[#261816]">Phone:</span>
                <span className="text-[#5a403c] font-medium">+91 44 4212 7800 / +91 988 422 0620</span>
              </div>

              <div className="flex items-center gap-3 text-xs sm:text-sm">
                <MessageSquare className="w-4 h-4 text-[#8b0000] shrink-0" />
                <span className="font-bold text-[#261816]">Live Chat:</span>
                <span className="text-[#5a403c] font-medium">Available 11 AM – 8 PM (Mon–Sat)</span>
              </div>
            </div>

            {/* Closing Signature */}
            <div className="pt-4 text-center sm:text-left border-t border-[#f0e6e4]">
              <p className="text-sm font-extrabold text-[#261816]">
                Shop with confidence. We’ve got your back.
              </p>
              <p className="text-xs text-[#8b0000] font-bold mt-0.5">
                — The Shop-O-Holics Team
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
