import { Heading, Text } from "@react-email/components";
import { EmailLayout, font } from "./EmailLayout.js";

export type PaymentReceivedEmailProps = {
  userName: string;
  senderName: string;
  amount: number;
  currency: string;
  reference: string;
};

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-GB", { style: "currency", currency }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

export default function PaymentReceivedEmail({ userName, senderName, amount, currency, reference }: PaymentReceivedEmailProps) {
  return (
    <EmailLayout preview={`You received a payment from ${senderName}`}>
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
        Payment received
      </Heading>
      <Text style={{ fontFamily: font, fontSize: "15px", lineHeight: 1.6, color: "#3f3f46", margin: "0 0 8px" }}>
        Dear {userName},
      </Text>
      <Text style={{ fontFamily: font, fontSize: "15px", lineHeight: 1.6, color: "#3f3f46", margin: "0 0 16px" }}>
        You have received a payment from <strong>{senderName}</strong>.
      </Text>
      <Text
        style={{
          fontFamily: font,
          fontSize: "14px",
          lineHeight: 1.7,
          color: "#18181b",
          backgroundColor: "#fafafa",
          padding: "16px",
          borderRadius: "6px",
          border: "1px solid #e4e4e7",
          margin: 0,
        }}
      >
        <span style={{ display: "block", marginBottom: "8px" }}>
          <strong>Amount:</strong> {formatMoney(amount, currency)}
        </span>
        <span style={{ display: "block" }}>
          <strong>Reference:</strong> {reference}
        </span>
      </Text>
    </EmailLayout>
  );
}
