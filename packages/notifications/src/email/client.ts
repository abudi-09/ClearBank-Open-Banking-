import { render } from "@react-email/render";
import type { ReactElement } from "react";
import { Resend } from "resend";

let resendSingleton: Resend | null = null;

/** Single shared Resend client (reads `RESEND_API_KEY` when constructed). */
export function initResend(): Resend {
  if (!resendSingleton) {
    const key = process.env.RESEND_API_KEY ?? "";
    resendSingleton = new Resend(key);
  }
  return resendSingleton;
}

function getFromAddress(): string {
  return process.env.RESEND_FROM_EMAIL ?? "ClearBank <onboarding@resend.dev>";
}

/**
 * Renders a React Email component to HTML and sends via Resend.
 * Never throws: failures are logged; returns `{ id: '' }` on error.
 */
export async function sendEmail(to: string, subject: string, component: ReactElement): Promise<{ id: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[@clearbank/notifications] sendEmail skipped: RESEND_API_KEY is not set.");
    return { id: "" };
  }

  try {
    const html = await render(component);
    const client = initResend();
    const { data, error } = await client.emails.send({
      from: getFromAddress(),
      to,
      subject,
      html,
    });

    if (error) {
      console.error("[@clearbank/notifications] Resend send failed:", error);
      return { id: "" };
    }

    return { id: data?.id ?? "" };
  } catch (error) {
    console.error("[@clearbank/notifications] sendEmail error:", error);
    return { id: "" };
  }
}
