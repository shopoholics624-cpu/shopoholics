"use client";

import React from "react";

interface DescriptionRendererProps {
  htmlContent: string;
  className?: string;
}

/**
 * Strips HTML tags to check for text content.
 */
function stripHtml(html: string): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").trim();
}

/**
 * Sanitizes raw HTML content by removing dangerous tags like <script>, <iframe>, and event handlers.
 */
function sanitizeHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
    .replace(/on\w+='[^']*'/gi, "")
    .replace(/javascript:/gi, "");
}

/**
 * Safe HTML Description Renderer for WooCommerce Product Descriptions.
 * Renders HTML tags (<p>, <ul>, <li>, <strong>, <h3>, <br>) cleanly without exposing raw code.
 * If WooCommerce description is empty/null/undefined or contains no text, returns null.
 */
export function DescriptionRenderer({ htmlContent, className }: DescriptionRendererProps) {
  if (!htmlContent || typeof htmlContent !== "string") {
    return null;
  }

  const rawText = stripHtml(htmlContent);
  if (!rawText || rawText === "No product description available.") {
    return null;
  }

  const sanitized = sanitizeHtml(htmlContent.trim());
  const hasHtml = /<[a-z][\s\S]*>/i.test(sanitized);

  if (hasHtml) {
    return (
      <div
        className={
          className ||
          "text-xs sm:text-sm text-[#5a403c] leading-relaxed space-y-2 bg-[#faf8f8] p-4 sm:p-5 rounded-2xl border border-[#e3beb8]/40 [&_p]:mb-2.5 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_h3]:font-bold [&_h3]:text-sm [&_h3]:text-[#261816] [&_h3]:mt-3 [&_h3]:mb-1 [&_h4]:font-bold [&_h4]:text-xs [&_h4]:text-[#261816] [&_strong]:font-bold [&_strong]:text-[#261816] [&_a]:text-[#8b0000] [&_a]:underline"
        }
        dangerouslySetInnerHTML={{ __html: sanitized }}
      />
    );
  }

  // Plain text fallback with paragraph line breaks
  const paragraphs = sanitized
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) return null;

  return (
    <div
      className={
        className ||
        "text-xs sm:text-sm text-[#5a403c] leading-relaxed space-y-3 bg-[#faf8f8] p-4 sm:p-5 rounded-2xl border border-[#e3beb8]/40"
      }
    >
      {paragraphs.map((p, idx) => (
        <p key={idx}>{p}</p>
      ))}
    </div>
  );
}
