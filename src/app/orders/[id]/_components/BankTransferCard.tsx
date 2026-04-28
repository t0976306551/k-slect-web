import Link from "next/link";
import { Landmark } from "lucide-react";
import { getMerchantBankAccount } from "@/lib/merchant";
import type { BankTransferSnapshot, BankTransferReport } from "@/types";

interface BankTransferCardProps {
  readonly orderId: string;
  readonly totalAmount: number;
  readonly paymentStatus: string;
  readonly snapshot?: BankTransferSnapshot | null;
  readonly bankReport: BankTransferReport | null;
}

function BankInfoRow({
  label,
  children,
}: {
  readonly label: string;
  readonly children: React.ReactNode;
}) {
  return (
    <div className="flex justify-between">
      <span className="text-[#9E9E9E]">{label}</span>
      {children}
    </div>
  );
}

export default function BankTransferCard({
  orderId,
  totalAmount,
  paymentStatus,
  snapshot,
  bankReport,
}: BankTransferCardProps) {
  const bank = snapshot ?? getMerchantBankAccount();
  const hasReport = !!bankReport;
  const isPending = paymentStatus === "pending";

  return (
    <div className="bg-[#7C9070]/5 border border-[#7C9070]/15 rounded-[16px] p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Landmark size={14} className="text-[#7C9070]" />
          <span className="text-[12px] font-semibold text-[#7C9070]">銀行匯款資訊</span>
        </div>
        {isPending && (
          <span
            className="text-[11px] px-2 py-0.5 rounded-full font-medium"
            style={{
              background: hasReport ? "#FFF8E1" : "#FFF3E0",
              color: hasReport ? "#D4A020" : "#E08020",
            }}
          >
            {hasReport ? "待商家對帳" : "待付款"}
          </span>
        )}
      </div>
      <div className="space-y-2 text-[12px]">
        <BankInfoRow label="銀行">
          <span className="font-medium text-[#2D2D2D]">
            {bank.bankName} ({bank.bankCode})
          </span>
        </BankInfoRow>
        <BankInfoRow label="分行">
          <span className="font-medium text-[#2D2D2D]">{bank.branchName}</span>
        </BankInfoRow>
        <BankInfoRow label="戶名">
          <span className="font-medium text-[#2D2D2D]">{bank.accountName}</span>
        </BankInfoRow>
        <BankInfoRow label="帳號">
          <span className="font-medium text-[#2D2D2D] font-mono tracking-wide">
            {bank.accountNumber}
          </span>
        </BankInfoRow>
        <BankInfoRow label="轉帳金額">
          <span className="font-bold text-[#7C9070] tabular-nums">
            NT$ {totalAmount.toLocaleString("zh-TW")}
          </span>
        </BankInfoRow>
        {hasReport && bankReport && (
          <div className="flex justify-between border-t border-[#7C9070]/15 pt-2 mt-2">
            <span className="text-[#9E9E9E]">已回報末五碼</span>
            <span className="font-mono font-semibold text-[#7C9070]">
              {bankReport.last5}
            </span>
          </div>
        )}
      </div>
      {isPending && (
        <Link
          href={`/checkout/bank-transfer?orderId=${orderId}&total=${totalAmount}`}
          className="mt-4 flex items-center justify-center gap-1 bg-[#7C9070] hover:bg-[#6a7d5f] text-white text-[13px] font-medium py-2.5 rounded-[10px] transition-colors"
        >
          {hasReport ? "查看匯款資訊" : "前往回報匯款"}
        </Link>
      )}
    </div>
  );
}
