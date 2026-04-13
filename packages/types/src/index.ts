import { z } from "zod";

export const UserRole = z.enum(["PERSONAL", "BUSINESS", "COMPLIANCE"]);
export const KYCStatus = z.enum(["PENDING", "VERIFIED", "REJECTED"]);
export const AccountType = z.enum(["CHECKING", "SAVINGS", "BUSINESS"]);
export const TransactionType = z.enum(["CREDIT", "DEBIT", "TRANSFER", "FX"]);
export const TransactionStatus = z.enum(["PENDING", "COMPLETED", "FAILED"]);
export const PaymentStatus = z.enum(["PENDING", "PROCESSING", "COMPLETED", "FAILED", "CANCELLED"]);
export const Currency = z.enum(["USD", "EUR", "GBP", "ETB", "KES", "AED", "SAR", "INR", "GHS", "NGN"]);

export const UserSchema = z.object({
  id: z.string(),
  email: z.email(),
  passwordHash: z.string(),
  role: UserRole,
  fullName: z.string(),
  kycStatus: KYCStatus,
  createdAt: z.date(),
});

export const AccountSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: AccountType,
  currency: Currency,
  balance: z.number(),
  iban: z.string(),
  isActive: z.boolean(),
});

export const TransactionSchema = z.object({
  id: z.string(),
  fromAccountId: z.string().nullable().optional(),
  toAccountId: z.string().nullable().optional(),
  amount: z.number(),
  currency: Currency,
  type: TransactionType,
  description: z.string(),
  status: TransactionStatus,
  reference: z.string(),
  createdAt: z.date(),
});

export const PaymentSchema = z.object({
  id: z.string(),
  fromAccountId: z.string(),
  toAccountId: z.string(),
  amount: z.number(),
  scheduledAt: z.date().nullable().optional(),
  status: PaymentStatus,
  reference: z.string(),
});

export const KYCDocumentSchema = z.object({
  id: z.string(),
  userId: z.string(),
  docType: z.enum(["PASSPORT", "DRIVING_LICENSE", "UTILITY_BILL"]),
  fileUrl: z.url(),
  reviewedBy: z.string().nullable().optional(),
  status: KYCStatus,
  createdAt: z.date(),
});

export const AuditLogSchema = z.object({
  id: z.string(),
  userId: z.string().nullable().optional(),
  action: z.string(),
  metadata: z.record(z.string(), z.unknown()),
  ipAddress: z.string(),
  createdAt: z.date(),
});

export const NotificationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  body: z.string(),
  type: z.string(),
  read: z.boolean(),
  createdAt: z.date(),
});

export const FXRateSchema = z.object({
  from: Currency,
  to: Currency,
  rate: z.number(),
  updatedAt: z.date(),
});

export type User = z.infer<typeof UserSchema>;
export type Account = z.infer<typeof AccountSchema>;
export type Transaction = z.infer<typeof TransactionSchema>;
export type Payment = z.infer<typeof PaymentSchema>;
export type KYCDocument = z.infer<typeof KYCDocumentSchema>;
export type AuditLog = z.infer<typeof AuditLogSchema>;
export type Notification = z.infer<typeof NotificationSchema>;
export type FXRate = z.infer<typeof FXRateSchema>;

export const RegisterInput = z.object({
  email: z.email(),
  password: z.string().min(8),
  fullName: z.string().min(2),
  role: UserRole,
});

export const LoginInput = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export const CreatePaymentInput = z.object({
  fromAccountId: z.string().min(1),
  toAccountId: z.string().min(1),
  amount: z.number().positive(),
  currency: Currency,
  description: z.string().min(1),
});

export const TransferInput = z.object({
  fromAccountId: z.string().min(1),
  toAccountId: z.string().min(1),
  amount: z.number().positive(),
  description: z.string().min(1),
});

export const KYCReviewInput = z.object({
  status: z.enum(["VERIFIED", "REJECTED"]),
  notes: z.string().optional(),
});

export * from "./money.js";
