"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid3X3, Search, ShoppingCart, User } from "lucide-react";

const tabs = [
  { href: "/", label: "首頁", Icon: Home },
  { href: "/products", label: "分類", Icon: Grid3X3 },
  { href: "/search", label: "搜尋", Icon: Search },
  { href: "/cart", label: "購物車", Icon: ShoppingCart },
  { href: "/account", label: "我的", Icon: User },
];

export default function TabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#F0EFEC] z-50 md:hidden">
      <div className="flex items-center justify-around h-[54px] pb-safe">
        {tabs.map(({ href, label, Icon }) => {
          const isActive = pathname === href || (href !== "/" && (pathname ?? "").startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-1 min-w-[60px]"
            >
              <Icon
                size={22}
                className={isActive ? "text-[#7C9070]" : "text-[#9E9E9E]"}
                strokeWidth={isActive ? 2 : 1.5}
              />
              <span
                className={`text-[10px] leading-none ${
                  isActive ? "text-[#7C9070] font-semibold" : "text-[#9E9E9E]"
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
