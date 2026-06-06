"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid3X3, ShoppingCart } from "lucide-react";

const tabs = [
  { href: "/", label: "首頁", Icon: Home },
  { href: "/", label: "商品", Icon: Grid3X3 },
  { href: "/cart", label: "購物車", Icon: ShoppingCart },
];

export default function TabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#F0EFEC] z-50 md:hidden pb-safe">
      <div className="flex items-center justify-around h-[54px]">
        {tabs.map(({ href, label, Icon }) => {
          const isActive = pathname === href || (href !== "/" && (pathname ?? "").startsWith(href));
          return (
            <Link
              key={label}
              href={href}
              className="flex flex-col items-center gap-1 min-w-[60px] relative active:scale-95 transition-transform duration-150"
            >
              {isActive && (
                <span
                  className="absolute -top-px left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-[#7C9070]"
                  style={{ animation: 'scale-in 0.2s cubic-bezier(0.34,1.3,0.64,1) both' }}
                />
              )}
              <Icon
                size={22}
                className={`transition-colors duration-200 ${isActive ? "text-[#7C9070]" : "text-[#9E9E9E]"}`}
                strokeWidth={isActive ? 2 : 1.5}
              />
              <span
                className={`text-[10px] leading-none transition-colors duration-200 ${
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
