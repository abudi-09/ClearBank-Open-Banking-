import { Heading, Text } from "@react-email/components";
import { EmailLayout, font } from "./EmailLayout.js";

export type KYCApprovedEmailProps = {
  userName: string;
};

export default function KYCApprovedEmail({ userName }: KYCApprovedEmailProps) {
  return (
    <EmailLayout preview="Your identity has been verified">
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
        KYC approved
      </Heading>
      <Text style={{ fontFamily: font, fontSize: "15px", lineHeight: 1.6, color: "#3f3f46", margin: "0 0 12px" }}>
        Dear {userName},
      </Text>
      <Text style={{ fontFamily: font, fontSize: "15px", lineHeight: 1.6, color: "#3f3f46", margin: 0 }}>
        Your Know Your Customer (KYC) documents have been reviewed and approved. You now have full access to eligible
        products and limits.
      </Text>
    </EmailLayout>
  );
}
