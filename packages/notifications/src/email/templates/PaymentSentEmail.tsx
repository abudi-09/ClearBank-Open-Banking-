import { Heading, Text } from "@react-email/components";
import { EmailLayout, font } from "./EmailLayout.js";

export type PaymentSentEmailProps = {
  userName: string;
  recipientName: string;
  amount: number;
  currency: string;
  reference: string;
  date: string;
};

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-GB", { style: "currency", currency }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

export default function PaymentSentEmail({
  userName,
  recipientName,
  amount,
  currency,
  reference,
  date,
}: PaymentSentEmailProps) {
  const preview = `Payment sent to ${recipientName}`;
  return (
    <EmailLayout preview={preview}>
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
        Payment sent
      </Heading>
      <Text style={{ fontFamily: font, fontSize: "15px", lineHeight: 1.6, color: "#3f3f46", margin: "0 0 8px" }}>
        Dear {userName},
      </Text>
      <Text style={{ fontFamily: font, fontSize: "15px", lineHeight: 1.6, color: "#3f3f46", margin: "0 0 16px" }}>
        Your payment to <strong>{recipientName}</strong> has been submitted successfully.
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
        <span style={{ display: "block", marginBottom: "8px" }}>
          <strong>Reference:</strong> {reference}
        </span>
        <span style={{ display: "block" }}>
          <strong>Date:</strong> {date}
        </span>
      </Text>
      <Text style={{ fontFamily: font, fontSize: "13px", lineHeight: 1.5, color: "#71717a", margin: "16px 0 0" }}>
        If you did not authorize this payment, contact us immediately.
      </Text>
    </EmailLayout>
  );
}
