import type { BankTransferSnapshot } from "@/types";

export type MerchantBankAccount = BankTransferSnapshot;

const env = (key: string, fallback: string) => process.env[key] ?? fallback;

export function getMerchantBankAccount(): MerchantBankAccount {
  return {
    bankName: env("NEXT_PUBLIC_MERCHANT_BANK_NAME", "玉山銀行"),
    bankCode: env("NEXT_PUBLIC_MERCHANT_BANK_CODE", "808"),
    branchName: env("NEXT_PUBLIC_MERCHANT_BANK_BRANCH", "板橋分行"),
    accountName: env(
      "NEXT_PUBLIC_MERCHANT_BANK_ACCOUNT_NAME",
      "K-slect 國際貿易股份有限公司",
    ),
    accountNumber: env("NEXT_PUBLIC_MERCHANT_BANK_ACCOUNT_NUMBER", "1234-5678-9012"),
    paymentDeadlineHours: Number(env("NEXT_PUBLIC_MERCHANT_PAYMENT_DEADLINE_HOURS", "24")),
  };
}


