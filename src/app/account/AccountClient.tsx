"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Package, LogOut, ChevronRight, Mail } from "lucide-react";

interface UserInfo {
  name: string;
  email: string;
}

export default function AccountClient() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    fetch("/api/v1/auth/me")
      .then((r) => r.json())
      .then((json) => {
        if (json.data) setUser(json.data);
        else router.replace("/login?from=/account");
      })
      .catch(() => router.replace("/login?from=/account"))
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch("/api/v1/auth/logout", { method: "POST" });
    router.replace("/login");
  };

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#7C9070] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-[480px] mx-auto px-4 md:px-6 py-6 md:py-10">
      {/* 個人資訊卡 */}
      <div className="bg-white rounded-[20px] border border-[#F0EFEC] p-6 mb-4 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-[#EBF1E8] flex items-center justify-center shrink-0">
          <User size={26} className="text-[#7C9070]" />
        </div>
        <div className="min-w-0">
          <p className="text-[17px] font-semibold text-[#2D2D2D] truncate">{user.name}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Mail size={12} className="text-[#9E9E9E] shrink-0" />
            <p className="text-[13px] text-[#9E9E9E] truncate">{user.email}</p>
          </div>
        </div>
      </div>

      {/* 功能選單 */}
      <div className="bg-white rounded-[16px] border border-[#F0EFEC] overflow-hidden mb-4">
        <Link
          href="/orders"
          className="flex items-center gap-3 px-5 py-4 hover:bg-[#F7F6F3] transition-colors border-b border-[#F0EFEC]"
        >
          <div className="w-9 h-9 rounded-[10px] bg-[#EBF1E8] flex items-center justify-center shrink-0">
            <Package size={18} className="text-[#7C9070]" />
          </div>
          <span className="flex-1 text-[15px] text-[#2D2D2D]">我的訂單</span>
          <ChevronRight size={16} className="text-[#C0C0C0]" />
        </Link>
      </div>

      {/* 登出 */}
      <button
        onClick={handleLogout}
        disabled={loggingOut}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-[12px] border border-[#F0EFEC] bg-white text-[15px] text-[#D4845E] hover:bg-[#FBE9E7] transition-colors disabled:opacity-60"
      >
        <LogOut size={16} />
        {loggingOut ? "登出中…" : "登出"}
      </button>
    </div>
  );
}
