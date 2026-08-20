"use client";

import Link, { LinkProps } from "next/link";
import { ReactNode, MouseEvent } from "react";
import { useDemo } from "@/hooks/use-demo";
import { DEMO_MODE } from "@/constants/demo";

interface DemoLinkProps extends LinkProps {
  children: ReactNode;
  className?: string;
  title?: string;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
  style?: React.CSSProperties;
}

export function DemoLink({
  href,
  children,
  className,
  title,
  onClick,
  style,
  ...props
}: DemoLinkProps) {
  const { openPreviewModal } = useDemo();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    const hrefStr = typeof href === "string" ? href : href.pathname || "";
    
    // Allow Homepage, Shop, Products, Cart, About, Wishlist, Compare, Profile/Account & Checkout routes to open directly
    const isAllowedRoute =
      hrefStr === "/" ||
      hrefStr === "#" ||
      hrefStr === "/shop" ||
      hrefStr === "/cart" ||
      hrefStr === "/about" ||
      hrefStr === "/about-us" ||
      hrefStr === "/contact" ||
      hrefStr === "/contact-us" ||
      hrefStr === "/privacy-policy" ||
      hrefStr === "/privacy" ||
      hrefStr === "/store-locations" ||
      hrefStr === "/store-locator" ||
      hrefStr === "/stores" ||
      hrefStr === "/returns-refunds" ||
      hrefStr === "/returns" ||
      hrefStr === "/returns-and-refunds" ||
      hrefStr === "/wishlist" ||
      hrefStr === "/compare" ||
      hrefStr.startsWith("/shop?") ||
      hrefStr.startsWith("/products/") ||
      hrefStr.startsWith("/categories/") ||
      hrefStr.startsWith("/account") ||
      hrefStr.startsWith("/checkout");

    if (onClick) {
      onClick(e);
    }

    if (DEMO_MODE && !isAllowedRoute) {
      e.preventDefault();
      e.stopPropagation();
      openPreviewModal();
    }
  };

  return (
    <Link
      href={href}
      className={className}
      title={title}
      style={style}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Link>
  );
}
