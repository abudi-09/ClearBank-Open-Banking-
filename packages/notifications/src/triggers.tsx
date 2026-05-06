import type { Account, Payment, User } from "@clearbank/types";
import { createElement } from "react";
import { sendEmail } from "./email/client.js";
import KYCApprovedEmail from "./email/templates/KYCApprovedEmail.js";
import KYCRejectedEmail from "./email/templates/KYCRejectedEmail.js";
import LowBalanceEmail from "./email/templates/LowBalanceEmail.js";
import PaymentReceivedEmail from "./email/templates/PaymentReceivedEmail.js";
import PaymentSentEmail from "./email/templates/PaymentSentEmail.js";
import WelcomeEmail from "./email/templates/WelcomeEmail.js";
import { createNotification, type InAppNotificationType } from "./inapp.js";

/** Payments missing `currency` in the base schema — API should pass an extended object with `currency`. */
export type PaymentWithCurrency = Payment & { currency: string };

function lowBalanceThreshold(): number {
  const raw = process.env.DEFAULT_LOW_BALANCE_THRESHOLD;
  if (raw === undefined || raw === "") return 100;
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? n : 100;
}

/** Email + in-app: payment initiated by sender. */
export async function onPaymentSent(payment: PaymentWithCurrency, fromUser: User, toUser: User): Promise<void> {
  const date = new Date().toISOString();
  await sendEmail(
    fromUser.email,
    "Payment sent",
    createElement(PaymentSentEmail, {
      userName: fromUser.fullName,
      recipientName: toUser.fullName,
      amount: payment.amount,
      currency: payment.currency,
      reference: payment.reference,
      date,
    }),
  ).catch(() => undefined);

  await createNotification(
    fromUser.id,
    "Payment sent",
    `${payment.amount} ${payment.currency} to ${toUser.fullName} (ref ${payment.reference})`,
    "PAYMENT",
  ).catch(() => undefined);
}

/** Email + in-app: credit to receiver. */
export async function onPaymentReceived(payment: PaymentWithCurrency, fromUser: User, toUser: User): Promise<void> {
  await sendEmail(
    toUser.email,
    "Payment received",
    createElement(PaymentReceivedEmail, {
      userName: toUser.fullName,
      senderName: fromUser.fullName,
      amount: payment.amount,
      currency: payment.currency,
      reference: payment.reference,
    }),
  ).catch(() => undefined);

  await createNotification(
    toUser.id,
    "Payment received",
    `${fromUser.fullName} sent ${payment.amount} ${payment.currency} (ref ${payment.reference})`,
    "PAYMENT",
  ).catch(() => undefined);
}

/** Email (approved/rejected) + in-app KYC alert. */
export async function onKYCStatusChanged(
  user: User,
  newStatus: User["kycStatus"],
  reason?: string,
): Promise<void> {
  if (newStatus === "VERIFIED") {
    await sendEmail(user.email, "KYC approved", createElement(KYCApprovedEmail, { userName: user.fullName })).catch(
      () => undefined,
    );
    await createNotification(user.id, "KYC approved", "Your identity verification is complete.", "KYC").catch(
      () => undefined,
    );
  } else if (newStatus === "REJECTED") {
    const message = reason?.trim() ? reason : "Please review your documents and resubmit.";
    await sendEmail(
      user.email,
      "KYC update required",
      createElement(KYCRejectedEmail, { userName: user.fullName, reason: message }),
    ).catch(() => undefined);
    await createNotification(user.id, "KYC update required", message, "KYC").catch(() => undefined);
  } else {
    await createNotification(user.id, "KYC status updated", `Your KYC status is ${newStatus}.`, "KYC").catch(
      () => undefined,
    );
  }
}

/** Email + in-app when balance is low; skipped entirely if `balance === 0`. */
export async function onLowBalance(account: Account, user: User): Promise<void> {
  if (account.balance === 0) {
    return;
  }

  const threshold = lowBalanceThreshold();

  await sendEmail(
    user.email,
    "Low balance alert",
    createElement(LowBalanceEmail, {
      userName: user.fullName,
      accountType: account.type,
      balance: account.balance,
      currency: account.currency,
      threshold,
    }),
  ).catch(() => undefined);

  await createNotification(
    user.id,
    "Low balance",
    `${account.type.replaceAll("_", " ")} account is below threshold (${threshold} ${account.currency}).`,
    "ALERT",
  ).catch(() => undefined);
}

/** Welcome email only (no in-app). */
export async function onWelcome(user: User): Promise<void> {
  await sendEmail(user.email, "Welcome to ClearBank", createElement(WelcomeEmail, { userName: user.fullName })).catch(
    () => undefined,
  );
}

export type { InAppNotificationType };
