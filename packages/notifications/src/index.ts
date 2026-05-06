export { initResend, sendEmail } from "./email/client.js";

export {
  createNotification,
  getUserNotifications,
  markAsRead,
  type InAppNotificationType,
} from "./inapp.js";

export type { PaymentWithCurrency } from "./triggers.js";

export {
  onKYCStatusChanged,
  onLowBalance,
  onPaymentReceived,
  onPaymentSent,
  onWelcome,
} from "./triggers.js";

/* Email templates (optional direct use / previews) */
export { default as WelcomeEmail, type WelcomeEmailProps } from "./email/templates/WelcomeEmail.js";
export { default as PaymentSentEmail, type PaymentSentEmailProps } from "./email/templates/PaymentSentEmail.js";
export {
  default as PaymentReceivedEmail,
  type PaymentReceivedEmailProps,
} from "./email/templates/PaymentReceivedEmail.js";
export { default as LowBalanceEmail, type LowBalanceEmailProps } from "./email/templates/LowBalanceEmail.js";
export { default as KYCApprovedEmail, type KYCApprovedEmailProps } from "./email/templates/KYCApprovedEmail.js";
export {
  default as KYCRejectedEmail,
  type KYCRejectedEmailProps,
} from "./email/templates/KYCRejectedEmail.js";
export { EmailLayout, font } from "./email/templates/EmailLayout.js";
