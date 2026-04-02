"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, AlertCircle, Zap } from "lucide-react";

type Tab = "login" | "register";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams?.get("from") ?? "/";
  const [tab, setTab] = useState<Tab>("login");
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const endpoint =
      tab === "login" ? "/api/v1/auth/login" : "/api/v1/auth/register";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const json = await res.json();

      if (!res.ok || json.error) {
        setError(json.error?.message ?? "操作失敗，請稍後再試");
        return;
      }

      router.push(from);
    } catch {
      setError("網路異常，請稍後再試");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (t: Tab) => {
    setTab(t);
    setError(null);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel (Desktop only) */}
      <div className="hidden md:flex flex-col items-center justify-center w-[45%] bg-[#7C9070] px-12">
        <div className="text-center">
          {/* Logo */}
          <div className="w-20 h-20 rounded-[20px] bg-white/20 flex items-center justify-center mx-auto mb-6">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path d="M20 5C13.5 5 8 9.5 8 15C8 18.5 10 21.5 13 23.5C12 26 10 28.5 7 30C10.5 30 14 28.5 16.5 26.5C17.5 27 18.7 27.5 20 27.5C26.5 27.5 32 23 32 17.5C32 11 26.5 5 20 5Z" fill="white" />
            </svg>
          </div>
          <h2 className="text-white text-[32px] font-display font-medium mb-3">K-slect</h2>
          <p className="text-white/70 text-[16px] leading-relaxed">
            嚴選韓貨，快速直送
          </p>
        </div>

        <div className="mt-16 text-center">
          <p className="text-white/50 text-[12px]">
            © 2026 K-slect · 隱私權 · 服務條款
          </p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center bg-[#F7F6F3] md:bg-white px-6 md:px-16">
        {/* Mobile Logo */}
        <div className="md:hidden text-center mb-10">
          <Link href="/" className="inline-flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-[12px] bg-[#7C9070] flex items-center justify-center">
              <span className="text-white text-xl font-bold">K</span>
            </div>
            <span className="text-[18px] font-semibold text-[#2D2D2D]">K-slect</span>
          </Link>
        </div>

        <div className="w-full max-w-[380px]">
          {/* Tabs */}
          <div className="flex border border-[#F0EFEC] rounded-[10px] p-1 mb-7 bg-[#F5F5F5] md:bg-transparent">
            <button
              onClick={() => handleTabChange("login")}
              className={`flex-1 py-2.5 text-[14px] font-semibold rounded-[8px] transition-all ${
                tab === "login"
                  ? "bg-white text-[#2D2D2D] shadow-sm"
                  : "text-[#9E9E9E]"
              }`}
            >
              登入
            </button>
            <button
              onClick={() => handleTabChange("register")}
              className={`flex-1 py-2.5 text-[14px] font-semibold rounded-[8px] transition-all ${
                tab === "register"
                  ? "bg-white text-[#2D2D2D] shadow-sm"
                  : "text-[#9E9E9E]"
              }`}
            >
              注冊
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 mb-5">
            <div>
              <label className="block text-[12px] text-[#9E9E9E] mb-1.5">電子郵件</label>
              <input
                type="email"
                placeholder="you@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-[#E8E8E8] bg-white rounded-[8px] px-4 py-3 text-[14px] text-[#2D2D2D] placeholder:text-[#D0D0D0] focus:outline-none focus:border-[#7C9070] transition-colors"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[12px] text-[#9E9E9E]">密碼</label>
                {tab === "login" && (
                  <button className="text-[12px] text-[#7C9070] hover:underline">
                    忘記密碼？
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full border border-[#E8E8E8] bg-white rounded-[8px] px-4 py-3 pr-11 text-[14px] text-[#2D2D2D] placeholder:text-[#D0D0D0] focus:outline-none focus:border-[#7C9070] transition-colors"
                />
                <button
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9E9E9E] hover:text-[#6B6B6B]"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </form>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 px-3 py-2.5 mb-3 bg-red-50 border border-red-200 rounded-[8px]">
              <AlertCircle size={14} className="text-red-500 shrink-0" />
              <span className="text-[13px] text-red-600">{error}</span>
            </div>
          )}

          {/* Primary Button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-[#7C9070] text-white text-[15px] font-semibold py-3.5 rounded-[10px] hover:bg-[#6B7F60] transition-colors mb-3 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "處理中..." : tab === "login" ? "登入" : "建立帳號"}
          </button>

          {/* Demo Login */}
          {tab === "login" && (
            <button
              type="button"
              onClick={() => {
                setForm({ email: "user@k-slect.com", password: "password123" });
                setError(null);
              }}
              className="w-full flex items-center justify-center gap-1.5 mb-4 border border-dashed border-[#C8D4C2] text-[13px] text-[#7C9070] py-2.5 rounded-[10px] hover:bg-[#F0F4EE] transition-colors"
            >
              <Zap size={15} />
              使用測試帳號快速填入
            </button>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-[1px] bg-[#F0EFEC]" />
            <span className="text-[12px] text-[#9E9E9E]">或</span>
            <div className="flex-1 h-[1px] bg-[#F0EFEC]" />
          </div>

          {/* Social Buttons */}
          <div className="flex gap-3">
            <button className="flex-1 flex items-center justify-center gap-2.5 border border-[#E8E8E8] bg-white text-[14px] font-medium text-[#2D2D2D] py-3 rounded-[10px] hover:border-[#D0D0D0] transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google 登入
            </button>
            <button className="flex-1 flex items-center justify-center gap-2.5 bg-[#06C755] text-white text-[14px] font-medium py-3 rounded-[10px] hover:bg-[#05B14A] transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.494.254l2.464 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.070 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
              </svg>
              LINE 登入
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
