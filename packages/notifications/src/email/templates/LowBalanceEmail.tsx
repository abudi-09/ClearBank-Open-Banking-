import { Heading, Text } from "@react-email/components";
import type { Account } from "@clearbank/types";
import { EmailLayout, font } from "./EmailLayout.js";

export type LowBalanceEmailProps = {
  userName: string;
  accountType: Account["type"];
  balance: number;
  currency: string;
  threshold: number;
};

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-GB", { style: "currency", currency }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

export default function LowBalanceEmail({ userName, accountType, balance, currency, threshold }: LowBalanceEmailProps) {
  return (
    <EmailLayout preview="Low account balance alert">
      <Heading
        as="h1"
        style={{
          fontFamily: font,
          fontSize: "22px",
          fontWeight: 600,
          color: "#18181b",
          margin: "0 0 16px",
        }}
      >
        Low balance alert
      </Heading>
      <Text style={{ fontFamily: font, fontSize: "15px", lineHeight: 1.6, color: "#3f3f46", margin: "0 0 8px" }}>
        Dear {userName},
      </Text>
      <Text style={{ fontFamily: font, fontSize: "15px", lineHeight: 1.6, color: "#3f3f46", margin: "0 0 16px" }}>
        Your <strong>{accountType.replaceAll("_", " ")}</strong> account balance has fallen below your alert threshold.
      </Text>
      <Text
        style={{
          fontFamily: font,
          fontSize: "14px",
          lineHeight: 1.7,
          color: "#18181b",
          backgroundColor: "#fffbeb",
          padding: "16px",
          borderRadius: "6px",
          border: "1px solid #fde68a",
          margin: 0,
        }}
      >
        <span style={{ display: "block", marginBottom: "8px" }}>
          <strong>Current balance:</strong> {formatMoney(balance, currency)}
        </span>
        <span style={{ display: "block" }}>
          <strong>Threshold:</strong> {formatMoney(threshold, currency)}
        </span>
      </Text>
    </EmailLayout>
  );
}
