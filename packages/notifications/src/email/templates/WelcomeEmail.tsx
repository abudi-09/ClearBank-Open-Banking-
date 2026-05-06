import { Heading, Text } from "@react-email/components";
import { EmailLayout, font } from "./EmailLayout.js";

export type WelcomeEmailProps = {
  userName: string;
};

export default function WelcomeEmail({ userName }: WelcomeEmailProps) {
  return (
    <EmailLayout preview="Welcome to ClearBank">
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
        Welcome to ClearBank
      </Heading>
      <Text style={{ fontFamily: font, fontSize: "15px", lineHeight: 1.6, color: "#3f3f46", margin: "0 0 12px" }}>
        Dear {userName},
      </Text>
      <Text style={{ fontFamily: font, fontSize: "15px", lineHeight: 1.6, color: "#3f3f46", margin: 0 }}>
        Your account is ready. You can sign in anytime to manage accounts, payments, and preferences securely.
      </Text>
    </EmailLayout>
  );
}
