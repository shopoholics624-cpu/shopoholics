import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import {
  Shield,
  FileText,
  UserCheck,
  Eye,
  Share2,
  Cookie,
  Lock,
  Scale,
  ExternalLink,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  Clock,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | Shop-O-Holics",
  description:
    "Review the Shop-O-Holics Privacy Policy to understand how we collect, use, protect, and safeguard your personal information.",
};

const policySections = [
  {
    id: "introduction",
    number: "1",
    title: "Introduction",
    icon: Shield,
    content: (
      <p className="text-sm sm:text-base text-[#5a403c] leading-relaxed">
        Welcome to <strong>Shop-O-Holics</strong> (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). We are committed to protecting your privacy when you visit our website <strong className="text-[#8b0000]">www.shopoholics.in</strong> (the &quot;Site&quot;). This Privacy Policy outlines how we collect, use, disclose, and safeguard your information.
      </p>
    ),
  },
  {
    id: "information-we-collect",
    number: "2",
    title: "Information We Collect",
    icon: FileText,
    content: (
      <div className="space-y-4 text-sm sm:text-base text-[#5a403c] leading-relaxed">
        <p>We may collect the following types of information:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div className="bg-[#fff9f8] border border-[#ffe9e6] rounded-2xl p-5 space-y-2">
            <h4 className="font-extrabold text-sm text-[#261816] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#8b0000]" />
              Personal Information
            </h4>
            <p className="text-xs text-[#5a403c] leading-relaxed">
              When you create an account, place an order, or contact us, we may collect personal information such as your name, email address, phone number, shipping address, and payment information.
            </p>
          </div>

          <div className="bg-[#fff9f8] border border-[#ffe9e6] rounded-2xl p-5 space-y-2">
            <h4 className="font-extrabold text-sm text-[#261816] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#8b0000]" />
              Non-Personal Information
            </h4>
            <p className="text-xs text-[#5a403c] leading-relaxed">
              We may also collect non-personal information, including but not limited to your IP address, browser type, device information, and pages visited on our Site.
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "how-we-use",
    number: "3",
    title: "How We Use Your Information",
    icon: UserCheck,
    content: (
      <div className="space-y-3 text-sm sm:text-base text-[#5a403c] leading-relaxed">
        <p>We use your information for various purposes, including:</p>
        <ul className="space-y-2.5 pt-1">
          {[
            "To process and fulfill your orders.",
            "To communicate with you regarding your orders and provide customer support.",
            "To send promotional emails about new products, special offers, and other information we think you may find interesting.",
            "To improve our website and services based on user feedback.",
            "To prevent fraudulent transactions and protect the security of our website.",
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-xs sm:text-sm">
              <div className="w-5 h-5 rounded-full bg-[#ffe9e6] text-[#8b0000] flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                ✓
              </div>
              <span className="text-[#261816]">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    ),
  },
  {
    id: "sharing-information",
    number: "4",
    title: "Sharing Your Information",
    icon: Share2,
    content: (
      <div className="space-y-3 text-sm sm:text-base text-[#5a403c] leading-relaxed">
        <p>We do not sell or rent your personal information to third parties. We may share your information with:</p>
        <div className="space-y-3 pt-1">
          <div className="p-4 rounded-xl bg-[#fafafa] border border-[#f0e6e4]">
            <p className="text-xs sm:text-sm">
              <strong className="text-[#261816]">Service Providers:</strong> Third-party vendors who assist us in operating our website, conducting our business, or servicing you (e.g., payment processors, shipping companies).
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[#fafafa] border border-[#f0e6e4]">
            <p className="text-xs sm:text-sm">
              <strong className="text-[#261816]">Legal Compliance:</strong> When required by law or to protect our rights, privacy, safety, or property, or that of others.
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "cookies",
    number: "5",
    title: "Cookies and Tracking Technologies",
    icon: Cookie,
    content: (
      <p className="text-sm sm:text-base text-[#5a403c] leading-relaxed">
        Our Site uses cookies and similar tracking technologies to enhance user experience and analyze site traffic. You can choose to accept or decline cookies through your browser settings. However, declining cookies may prevent you from taking full advantage of the Site.
      </p>
    ),
  },
  {
    id: "security",
    number: "6",
    title: "Security of Your Information",
    icon: Lock,
    content: (
      <p className="text-sm sm:text-base text-[#5a403c] leading-relaxed">
        We take reasonable precautions to protect your personal information from unauthorized access, use, or disclosure. However, no method of transmission over the internet or method of electronic storage is 100% secure. Therefore, we cannot guarantee its absolute security.
      </p>
    ),
  },
  {
    id: "your-rights",
    number: "7",
    title: "Your Rights",
    icon: Scale,
    content: (
      <div className="space-y-3 text-sm sm:text-base text-[#5a403c] leading-relaxed">
        <p>You have the right to:</p>
        <ul className="space-y-2 pt-1">
          {[
            "Access your personal information.",
            "Request correction of any inaccurate information.",
            "Request deletion of your personal information, subject to certain exceptions.",
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
    ),
  },
  {
    id: "third-party-links",
    number: "8",
    title: "Third-Party Links",
    icon: ExternalLink,
    content: (
      <p className="text-sm sm:text-base text-[#5a403c] leading-relaxed">
        Our Site may contain links to third-party websites. We are not responsible for the privacy practices or content of those sites. We encourage you to review their privacy policies before providing any personal information.
      </p>
    ),
  },
  {
    id: "policy-changes",
    number: "9",
    title: "Changes to This Privacy Policy",
    icon: RefreshCw,
    content: (
      <p className="text-sm sm:text-base text-[#5a403c] leading-relaxed">
        We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page. You are advised to review this Privacy Policy periodically for any changes.
      </p>
    ),
  },
  {
    id: "contact-us",
    number: "10",
    title: "Contact Us",
    icon: Mail,
    content: (
      <div className="space-y-4 text-sm sm:text-base text-[#5a403c] leading-relaxed">
        <p>If you have any questions or concerns about this Privacy Policy or our data practices, please contact us at:</p>
        <div className="bg-[#fff9f8] border border-[#ffe9e6] rounded-2xl p-6 space-y-4">
          <div>
            <h4 className="text-base font-extrabold text-[#261816]">Shop-O-Holics</h4>
            <p className="text-xs sm:text-sm text-[#5a403c] flex items-start gap-2 mt-1">
              <MapPin className="w-4 h-4 text-[#8b0000] shrink-0 mt-0.5" />
              <span>Shop D, 86, Audiappa Naicken Street, Sowcarpet, Chennai – 600001</span>
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#ffe9e6]">
            <a
              href="mailto:support@shopoholics.in"
              className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#8b0000] hover:underline"
            >
              <Mail className="w-4 h-4 shrink-0" />
              support@shopoholics.in
            </a>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-[#261816]">
              <Phone className="w-4 h-4 text-[#8b0000] shrink-0" />
              <span>9884220620 / 044-42127800</span>
            </div>
          </div>
        </div>
      </div>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Top Header & Breadcrumbs Banner */}
      <div className="bg-[#fff9f8] border-b border-[#ffe9e6] py-6 sm:py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3 text-center sm:text-left">
          <Breadcrumbs items={[{ label: "Privacy Policy" }]} />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#261816] tracking-tight">
              Privacy Policy
            </h1>
            <div className="flex items-center gap-2 text-xs font-bold text-[#8b0000] bg-[#ffe9e6] px-3.5 py-1.5 rounded-full border border-[#f8dcd8] w-fit mx-auto sm:mx-0">
              <Clock className="w-3.5 h-3.5" />
              <span>Effective Date: 01-Apr-2025</span>
            </div>
          </div>
        </div>
      </div>

      {/* Policy Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="space-y-8 divide-y divide-[#f0e6e4]">
          {policySections.map((section, idx) => {
            const Icon = section.icon;
            return (
              <section
                key={section.id}
                id={section.id}
                className={idx === 0 ? "space-y-4" : "pt-8 space-y-4"}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#ffe9e6] text-[#8b0000] flex items-center justify-center shrink-0 border border-[#f8dcd8]">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-[#261816] tracking-tight">
                    {section.number}. {section.title}
                  </h2>
                </div>

                <div className="pl-0 sm:pl-12">
                  {section.content}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
