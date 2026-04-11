import { NextRequest, NextResponse } from "next/server";
import { listTransactions } from "../../../../../packages/database/index";
import { SESSION_COOKIE_NAME, verifySessionToken } from "../../../lib/auth";

async function getSession(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

export interface Anomaly {
  id: string;
  type: "unusual_amount" | "category_spike" | "large_transaction";
  severity: "warning" | "alert";
  message: string;
  detail: string;
  amount?: number;
  category?: string;
  transactionId?: string;
  transactionLabel?: string;
}

function stddev(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1]! + sorted[mid]!) / 2
    : sorted[mid]!;
}

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const all = await listTransactions(session.email);
    const expenses = all.filter((t) => t.type === "expense");

    if (expenses.length < 5) {
      return NextResponse.json({ anomalies: [] });
    }

    const now = new Date();
    const msPerDay = 1000 * 60 * 60 * 24;
    const thirtyDaysAgo = new Date(now.getTime() - 30 * msPerDay);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * msPerDay);

    const recent = expenses.filter((t) => new Date(t.date) >= thirtyDaysAgo);
    const historical = expenses.filter(
      (t) => new Date(t.date) >= sixtyDaysAgo && new Date(t.date) < thirtyDaysAgo,
    );

    const anomalies: Anomaly[] = [];

    // ── 1. Outlier per category (Z-score > 2) ──────────────────────────────
    const categoryHistory: Record<string, number[]> = {};
    for (const t of historical) {
      const cat = t.category ?? "Divers";
      (categoryHistory[cat] ??= []).push(t.amount);
    }

    for (const t of recent) {
      const cat = t.category ?? "Divers";
      const history = categoryHistory[cat];
      if (!history || history.length < 3) continue;

      const mean = history.reduce((a, b) => a + b, 0) / history.length;
      const sd = stddev(history);
      if (sd === 0) continue;

      const z = (t.amount - mean) / sd;
      if (z > 2.2) {
        anomalies.push({
          id: `unusual-${t.id}`,
          type: "unusual_amount",
          severity: z > 3 ? "alert" : "warning",
          message: `Montant inhabituel — ${cat}`,
          detail: `${t.label} : ${t.amount.toFixed(2)} € vs moy. ${mean.toFixed(2)} €`,
          amount: t.amount,
          category: cat,
          transactionId: t.id,
          transactionLabel: t.label,
        });
      }
    }

    // ── 2. Month-over-month category spike ─────────────────────────────────
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const currentByCategory: Record<string, number> = {};
    const prevByCategory: Record<string, number> = {};

    for (const t of expenses) {
      const d = new Date(t.date);
      const cat = t.category ?? "Divers";
      if (d >= currentMonthStart) {
        currentByCategory[cat] = (currentByCategory[cat] ?? 0) + t.amount;
      } else if (d >= prevMonthStart) {
        prevByCategory[cat] = (prevByCategory[cat] ?? 0) + t.amount;
      }
    }

    for (const [cat, current] of Object.entries(currentByCategory)) {
      const prev = prevByCategory[cat] ?? 0;
      if (prev < 20) continue; // ignore tiny previous months
      const ratio = current / prev;
      const diff = current - prev;
      if (ratio > 1.8 && diff > 50) {
        anomalies.push({
          id: `spike-${cat}`,
          type: "category_spike",
          severity: ratio > 2.5 ? "alert" : "warning",
          message: `Hausse des dépenses — ${cat}`,
          detail: `+${diff.toFixed(0)} € ce mois (×${ratio.toFixed(1)} vs mois dernier)`,
          amount: current,
          category: cat,
        });
      }
    }

    // ── 3. Unusually large single transaction ─────────────────────────────
    const allAmounts = expenses.map((t) => t.amount);
    const med = median(allAmounts);

    for (const t of recent) {
      if (t.amount > med * 4 && t.amount > 150) {
        const alreadyFlagged = anomalies.some((a) => a.transactionId === t.id);
        if (!alreadyFlagged) {
          anomalies.push({
            id: `large-${t.id}`,
            type: "large_transaction",
            severity: t.amount > med * 7 ? "alert" : "warning",
            message: `Dépense exceptionnelle`,
            detail: `${t.label} : ${t.amount.toFixed(2)} € (×${(t.amount / med).toFixed(1)} vs médiane ${med.toFixed(0)} €)`,
            amount: t.amount,
            category: t.category ?? "Divers",
            transactionId: t.id,
            transactionLabel: t.label,
          });
        }
      }
    }

    // Deduplicate by message and sort by severity
    const seen = new Set<string>();
    const unique = anomalies.filter((a) => {
      const key = `${a.type}-${a.category ?? ""}-${a.transactionId ?? ""}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    unique.sort((a, b) => (a.severity === "alert" ? -1 : 1) - (b.severity === "alert" ? -1 : 1));

    return NextResponse.json({ anomalies: unique.slice(0, 8) });
  } catch (err) {
    console.error("[anomalies]", err);
    return NextResponse.json({ error: "Detection failed" }, { status: 500 });
  }
}
