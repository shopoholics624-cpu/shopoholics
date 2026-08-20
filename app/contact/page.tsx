"use client";

import { useState } from "react";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import {
  MapPin,
  Phone,
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
} from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);

    // Simulate sending message
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setIsSubmitted(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch {
      setErrorMessage("Failed to send message. Please try again or reach us by phone/email.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top Header & Breadcrumbs Banner */}
      <div className="bg-[#fff9f8] border-b border-[#ffe9e6] py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3 text-center sm:text-left">
          <Breadcrumbs items={[{ label: "Contact Us" }]} />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#261816] tracking-tight">
              Contact Us
            </h1>
            <span className="text-xs font-bold text-[#8b0000] uppercase tracking-widest bg-[#ffe9e6] px-3.5 py-1 rounded-full w-fit mx-auto sm:mx-0 border border-[#f8dcd8]">
              We&apos;re Here To Help
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* Left Column: Contact Form */}
          <div className="lg:col-span-8 space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#261816] tracking-tight mb-2">
                Leave A Message
              </h2>
              <div className="w-12 h-1 bg-[#e51937] rounded-full mb-6" />
            </div>

            {isSubmitted && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3 text-emerald-800 text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Thank you for reaching out!</p>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    Your message has been sent successfully. Our support team will get back to you shortly.
                  </p>
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-800 text-sm">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <p className="font-medium text-xs sm:text-sm">{errorMessage}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div className="space-y-1.5">
                <label htmlFor="name" className="block text-xs font-bold text-[#261816] uppercase tracking-wider">
                  Your Name <span className="text-[#e51937]">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your Name (required)"
                  required
                  className="w-full px-4 py-3.5 rounded-xl bg-[#fcf9f9] border border-[#e3beb8] text-[#261816] placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:border-[#8b0000] focus:ring-2 focus:ring-[#ffe9e6] transition-all"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-xs font-bold text-[#261816] uppercase tracking-wider">
                  Your Email <span className="text-[#e51937]">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Your Email (required)"
                  required
                  className="w-full px-4 py-3.5 rounded-xl bg-[#fcf9f9] border border-[#e3beb8] text-[#261816] placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:border-[#8b0000] focus:ring-2 focus:ring-[#ffe9e6] transition-all"
                />
              </div>

              {/* Subject */}
              <div className="space-y-1.5">
                <label htmlFor="subject" className="block text-xs font-bold text-[#261816] uppercase tracking-wider">
                  Subject
                </label>
                <input
                  id="subject"
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Subject"
                  className="w-full px-4 py-3.5 rounded-xl bg-[#fcf9f9] border border-[#e3beb8] text-[#261816] placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:border-[#8b0000] focus:ring-2 focus:ring-[#ffe9e6] transition-all"
                />
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <label htmlFor="message" className="block text-xs font-bold text-[#261816] uppercase tracking-wider">
                  Your Message <span className="text-[#e51937]">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Your Message"
                  required
                  className="w-full px-4 py-3.5 rounded-xl bg-[#fcf9f9] border border-[#e3beb8] text-[#261816] placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:border-[#8b0000] focus:ring-2 focus:ring-[#ffe9e6] transition-all resize-y"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3.5 rounded-xl bg-[#8b0000] hover:bg-[#bc0000] text-white font-bold text-xs uppercase tracking-wider inline-flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-60 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Column: Address & Get In Touch Info */}
          <div className="lg:col-span-4 space-y-8 lg:border-l lg:border-[#ffe9e6] lg:pl-10">
            
            {/* Our Address Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#ffe9e6] text-[#8b0000] flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <h3 className="text-xl font-extrabold text-[#261816] tracking-tight">
                  Our Address
                </h3>
              </div>
              <div className="w-10 h-0.5 bg-[#e51937] rounded-full" />
              <p className="text-sm text-[#5a403c] leading-relaxed pt-1">
                Shop D, 86, Audiappa Naicken Street,<br />
                Sowcarpet, Chennai – 600001
              </p>
            </div>

            <div className="w-full h-px bg-[#ffe9e6]" />

            {/* Get In Touch Section */}
            <div className="space-y-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#ffe9e6] text-[#8b0000] flex items-center justify-center">
                  <Phone className="w-4 h-4" />
                </div>
                <h3 className="text-xl font-extrabold text-[#261816] tracking-tight">
                  Get In Touch
                </h3>
              </div>
              <div className="w-10 h-0.5 bg-[#e51937] rounded-full" />

              {/* Support Phone */}
              <div className="space-y-1 pt-1">
                <span className="text-xs font-extrabold text-[#8b0000] uppercase tracking-wider block">
                  FOR SUPPORT :
                </span>
                <p className="text-sm font-semibold text-[#261816]">
                  +91 44 4212 7800 <span className="text-slate-400 font-normal">or</span> +91 988 422 0620
                </p>
              </div>

              {/* Email */}
              <div className="space-y-1 pt-1">
                <span className="text-xs font-extrabold text-[#8b0000] uppercase tracking-wider block">
                  EMAIL ADDRESS :
                </span>
                <a
                  href="mailto:support@shopoholics.in"
                  className="text-sm font-semibold text-[#8b0000] hover:underline block"
                >
                  support@shopoholics.in
                </a>
              </div>

              {/* Business Hours */}
              <div className="space-y-1 pt-1">
                <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#8b0000]" /> Working Hours :
                </span>
                <p className="text-xs text-[#5a403c]">
                  Mon - Sat: 10:30 AM - 8:00 PM (Sunday Closed)
                </p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
