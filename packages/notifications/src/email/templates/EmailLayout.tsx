import { Body, Container, Hr, Html, Preview, Section, Text } from "@react-email/components";
import type { ReactNode } from "react";

const font =
  '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';

type Props = {
  preview: string;
  children: ReactNode;
};

export function EmailLayout({ preview, children }: Props) {
  return (
    <Html>
      <Body
        style={{
          margin: 0,
          padding: "24px 0",
          backgroundColor: "#f4f4f5",
        }}
      >
        <Preview>{preview}</Preview>
        <Container
          style={{
            maxWidth: "560px",
            margin: "0 auto",
            backgroundColor: "#ffffff",
            borderRadius: "8px",
            padding: "32px 40px",
            border: "1px solid #e4e4e7",
          }}
        >
          {/* ClearBank logo placeholder */}
          <Section style={{ marginBottom: "24px" }}>
            <div
              style={{
                width: "120px",
                height: "32px",
                backgroundColor: "#d4d4d8",
                borderRadius: "4px",
              }}
            />
          </Section>

          {children}

          <Hr style={{ margin: "28px 0", borderColor: "#e4e4e7" }} />
          <Text
            style={{
              fontFamily: font,
              fontSize: "11px",
              lineHeight: "16px",
              color: "#71717a",
              margin: 0,
            }}
          >
            ClearBank — Licensed by the National Bank of Ethiopia
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export { font };
