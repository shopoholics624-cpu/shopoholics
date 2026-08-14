"use client";

import { DemoLink as Link } from "@/components/demo/demo-link";
import { usePathname } from "next/navigation";
import { Home, Store, ArrowLeftRight, ShoppingBag, User, Heart } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useCompare } from "@/hooks/use-compare";
import { useWishlist } from "@/hooks/use-wishlist";

export function MobileNav() {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const { compareList } = useCompare();
  const { wishlistCount } = useWishlist();

  const items = [
    { name: "Home", href: "/", icon: Home },
    { name: "Shop", href: "/shop", icon: Store },
    { name: "Wishlist", href: "/wishlist", icon: Heart, badge: wishlistCount },
    { name: "Bag", href: "/cart", icon: ShoppingBag, badge: itemCount },
    { name: "Account", href: "/account/orders", icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden glass-nav-mobile px-4 py-2">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl text-xs font-medium transition-colors relative ${
                isActive ? "text-[#8b0000] font-bold" : "text-[#5a403c] hover:text-[#8b0000]"
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {Boolean(item.badge && item.badge > 0) && (
                  <span className="absolute -top-1 -right-2 px-1 py-0.2 bg-[#8b0000] text-white text-[9px] font-bold rounded-full min-w-[14px] text-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
