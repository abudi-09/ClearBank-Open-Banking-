import type { AmlAlert, Budget, BulkPaymentInstruction, SavingsGoal } from "@clearbank/types";

export type NotificationChannel = "email" | "sms" | "inbox";

export interface NotificationMessage {
  id: string;
  recipientId: string;
  channel: NotificationChannel;
  subject: string;
  body: string;
  sentAt: string;
}

export class NotificationService {
  private readonly outbox: NotificationMessage[] = [];

  sendBudgetWarning(budget: Budget): NotificationMessage {
    return this.push({
      id: `budget-${budget.id}`,
      recipientId: budget.userId,
      channel: "inbox",
      subject: `Budget alert for ${budget.category}`,
      body: `Your limit is ${budget.monthlyLimit.amount} ${budget.monthlyLimit.currency}.`,
      sentAt: new Date().toISOString(),
    });
  }

  sendGoalMilestone(goal: SavingsGoal): NotificationMessage {
    return this.push({
      id: `goal-${goal.id}`,
      recipientId: goal.userId,
      channel: "inbox",
      subject: `Savings milestone reached`,
      body: `${goal.name} is now at ${goal.currentAmount.amount} ${goal.currentAmount.currency}.`,
      sentAt: new Date().toISOString(),
    });
  }

  sendBulkPaymentProcessed(payment: BulkPaymentInstruction, recipientId: string): NotificationMessage {
    return this.push({
      id: `bulk-payment-${payment.id}`,
      recipientId,
      channel: "email",
      subject: `Bulk payment instruction accepted`,
      body: `${payment.amount.amount} ${payment.amount.currency} queued with reference ${payment.reference}.`,
      sentAt: new Date().toISOString(),
    });
  }

  sendAmlEscalation(alert: AmlAlert, recipientId: string): NotificationMessage {
    return this.push({
      id: `aml-${alert.id}`,
      recipientId,
      channel: "email",
      subject: `AML escalation: ${alert.severity.toUpperCase()}`,
      body: `${alert.reason} on account ${alert.accountId}.`,
      sentAt: new Date().toISOString(),
    });
  }

  list(): NotificationMessage[] {
    return [...this.outbox];
  }

  private push(message: NotificationMessage): NotificationMessage {
    this.outbox.push(message);
    return message;
  }
}
