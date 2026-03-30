import TabBar from "@/components/TabBar";
import OrdersClient from "./OrdersClient";

export const metadata = { title: "我的訂單 | 韓好物" };

export default function OrdersPage() {
  return (
    <div className="min-h-screen bg-[#F7F6F3]">
      <OrdersClient />
      <div className="h-20 md:hidden" />
      <TabBar />
    </div>
  );
}
