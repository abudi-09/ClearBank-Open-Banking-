import { Heading, Text } from "@react-email/components";
import { EmailLayout, font } from "./EmailLayout.js";

export type KYCRejectedEmailProps = {
  userName: string;
  reason: string;
};

export default function KYCRejectedEmail({ userName, reason }: KYCRejectedEmailProps) {
  return (
    <EmailLayout preview="Action required: KYC review">
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
        KYC update required
      </Heading>
      <Text style={{ fontFamily: font, fontSize: "15px", lineHeight: 1.6, color: "#3f3f46", margin: "0 0 8px" }}>
        Dear {userName},
      </Text>
      <Text style={{ fontFamily: font, fontSize: "15px", lineHeight: 1.6, color: "#3f3f46", margin: "0 0 16px" }}>
        We were not able to approve your submitted documents at this time.
      </Text>
      <Text
        style={{
          fontFamily: font,
          fontSize: "14px",
          lineHeight: 1.6,
          color: "#18181b",
          backgroundColor: "#fef2f2",
          border: "1px solid #fecaca",
          borderRadius: "6px",
          padding: "14px 16px",
          margin: 0,
        }}
      >
        <strong>Reason:</strong> {reason}
      </Text>
      <Text style={{ fontFamily: font, fontSize: "15px", lineHeight: 1.6, color: "#3f3f46", margin: "16px 0 0" }}>
        Please sign in to upload corrected documents or contact support if you need help.
      </Text>
    </EmailLayout>
  );
}
