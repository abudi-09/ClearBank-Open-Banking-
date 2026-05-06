import type { Notification } from "@clearbank/types";

function baseUrl(): string {
  return (process.env.INTERNAL_API_URL ?? "http://localhost:4000").replace(/\/$/, "");
}

/** Header value from env; sent as `INTERNAL_API_SECRET` (and `X-Internal-Api-Secret` for proxies). */
function internalAuthHeaders(): HeadersInit {
  const secret = process.env.INTERNAL_API_SECRET ?? "";
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (secret) {
    headers.INTERNAL_API_SECRET = secret;
    headers["X-Internal-Api-Secret"] = secret;
  }
  return headers;
}

async function safeFetch(url: string, init: RequestInit, context: string): Promise<Response> {
  try {
    return await fetch(url, init);
  } catch (error) {
    console.error(`[@clearbank/notifications] ${context} request failed:`, error);
    throw error;
  }
}

export type InAppNotificationType = "PAYMENT" | "KYC" | "ALERT" | "SYSTEM";

export async function createNotification(
  userId: string,
  title: string,
  body: string,
  type: InAppNotificationType,
): Promise<void> {
  const url = `${baseUrl()}/internal/notifications`;
  const res = await safeFetch(
    url,
    {
      method: "POST",
      headers: internalAuthHeaders(),
      body: JSON.stringify({ userId, title, body, type }),
    },
    "createNotification",
  );
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error(
      "[@clearbank/notifications] createNotification failed:",
      res.status,
      res.statusText,
      text,
    );
  }
}

export async function markAsRead(notificationId: string): Promise<void> {
  const url = `${baseUrl()}/internal/notifications/${encodeURIComponent(notificationId)}/read`;
  const res = await safeFetch(
    url,
    {
      method: "PATCH",
      headers: internalAuthHeaders(),
    },
    "markAsRead",
  );
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("[@clearbank/notifications] markAsRead failed:", res.status, res.statusText, text);
  }
}

function normalizeNotification(raw: unknown): Notification {
  const n = raw as Record<string, unknown>;
  return {
    id: String(n.id ?? ""),
    userId: String(n.userId ?? ""),
    title: String(n.title ?? ""),
    body: String(n.body ?? ""),
    type: String(n.type ?? ""),
    read: Boolean(n.read),
    createdAt: n.createdAt instanceof Date ? n.createdAt : new Date(String(n.createdAt ?? Date.now())),
  };
}

export async function getUserNotifications(userId: string): Promise<Notification[]> {
  const url = `${baseUrl()}/internal/notifications?userId=${encodeURIComponent(userId)}`;
  let res: Response;
  try {
    res = await fetch(url, { headers: internalAuthHeaders() });
  } catch (error) {
    console.error("[@clearbank/notifications] getUserNotifications request failed:", error);
    return [];
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("[@clearbank/notifications] getUserNotifications failed:", res.status, text);
    return [];
  }
  const data = (await res.json()) as unknown;
  const list = Array.isArray(data) ? data : (data as { items?: unknown[] }).items ?? [];
  return list.map(normalizeNotification);
}
