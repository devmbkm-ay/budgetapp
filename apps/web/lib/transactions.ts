export type TransactionType = "expense" | "income";

export interface TransactionRecord {
  amount: number;
  category: string | null;
  currency: string;
  date: string;
  id: string;
  label: string;
  type: TransactionType;
  userEmail: string;
  userId: string;
  userName: string | null;
}

export const DEFAULT_TRANSACTION_CATEGORY_LABEL = "Categorie libre";

export const formatCurrency = (amount: number, currency: string) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
  }).format(amount);

export const formatDate = (value: string) =>
  new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));

export const formatLongDate = (value: string) =>
  new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));

export function formatShortDate(value: string, options?: { includeYear?: boolean }) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    ...(options?.includeYear === false ? {} : { year: "numeric" }),
  }).format(new Date(value));
}

export const categoryEmoji = (category: string | null) => {
  const normalized = (category ?? "").toLowerCase();

  if (normalized.includes("alim")) return "🍽️";
  if (normalized.includes("transport")) return "🚇";
  if (normalized.includes("shop")) return "🛍️";
  if (normalized.includes("loisir")) return "🎞️";
  if (normalized.includes("salaire")) return "💼";
  if (normalized.includes("freelance")) return "✨";

  return "•";
};
