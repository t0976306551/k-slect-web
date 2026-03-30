import TabBar from "@/components/TabBar";
import AccountClient from "./AccountClient";

export const metadata = { title: "我的帳號 | 韓好物" };

export default function AccountPage() {
  return (
    <div className="min-h-screen bg-[#F7F6F3]">
      <AccountClient />
      <div className="h-20 md:hidden" />
      <TabBar />
    </div>
  );
}
