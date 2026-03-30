import TabBar from "@/components/TabBar";
import OrderDetailClient from "./OrderDetailClient";

export const metadata = { title: "訂單詳情 | 韓好物" };

export default function OrderDetailPage() {
  return (
    <div className="min-h-screen bg-[#F7F6F3]">
      <OrderDetailClient />
      <div className="h-20 md:hidden" />
      <TabBar />
    </div>
  );
}
