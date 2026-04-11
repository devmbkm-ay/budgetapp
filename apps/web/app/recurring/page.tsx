"use client";

import { useEffect, useState } from "react";

interface RecurringItem {
  id: string;
  label: string;
  amount: number;
  currency: string;
  category: string | null;
  type: string;
  frequency: string;
  startDate: string;
  endDate: string | null;
  lastGeneratedAt: string | null;
  isActive: boolean;
}

const FREQUENCY_LABELS: Record<string, string> = {
  weekly: "Hebdo",
  biweekly: "Bi-mensuel",
  monthly: "Mensuel",
  quarterly: "Trimestriel",
  yearly: "Annuel",
};

const FREQUENCY_EMOJIS: Record<string, string> = {
  weekly: "📆",
  biweekly: "🗓️",
  monthly: "📅",
  quarterly: "🗃️",
  yearly: "🎯",
};

const CATEGORY_OPTIONS = [
  "Logement", "Alimentation", "Transport", "Santé", "Loisirs",
  "Abonnements", "Épargne", "Salaire", "Freelance", "Autre",
];

function nextOccurrence(startDate: string, frequency: string): string {
  const start = new Date(startDate);
  const now = new Date();
  let next = new Date(start);

  while (next <= now) {
    switch (frequency) {
      case "weekly": next.setDate(next.getDate() + 7); break;
      case "biweekly": next.setDate(next.getDate() + 14); break;
      case "monthly": next.setMonth(next.getMonth() + 1); break;
      case "quarterly": next.setMonth(next.getMonth() + 3); break;
      case "yearly": next.setFullYear(next.getFullYear() + 1); break;
      default: return "—";
    }
  }

  const diff = Math.ceil((next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "Aujourd'hui";
  if (diff === 1) return "Demain";
  if (diff <= 7) return `Dans ${diff} jours`;
  return next.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

const s = {
  page: {
    minHeight: "100dvh",
    padding: "24px 16px 120px",
    maxWidth: 480,
    margin: "0 auto",
    fontFamily: "inherit",
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: "1.7rem",
    fontWeight: 800,
    color: "#f6fbff",
    letterSpacing: "-0.02em",
    lineHeight: 1.1,
  },
  subtitle: {
    fontSize: "0.85rem",
    color: "rgba(208,224,255,0.50)",
    marginTop: 4,
  },
  addCard: {
    background: "rgba(10,16,30,0.80)",
    border: "1.5px dashed rgba(100,210,255,0.25)",
    borderRadius: 20,
    padding: "20px",
    marginBottom: 24,
    backdropFilter: "blur(16px)",
  },
  addTitle: {
    fontSize: "0.85rem",
    fontWeight: 700,
    color: "rgba(100,210,255,0.80)",
    marginBottom: 14,
    textTransform: "uppercase" as const,
    letterSpacing: "0.06em",
  },
  row2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
    marginBottom: 10,
  },
  label: {
    fontSize: "0.72rem",
    fontWeight: 700,
    color: "rgba(208,224,255,0.45)",
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
    marginBottom: 4,
    display: "block",
  },
  input: {
    width: "100%",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: 12,
    padding: "10px 12px",
    color: "#f6fbff",
    fontSize: "0.9rem",
    fontFamily: "inherit",
    outline: "none",
  },
  select: {
    width: "100%",
    background: "rgba(10,16,30,0.90)",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: 12,
    padding: "10px 12px",
    color: "#f6fbff",
    fontSize: "0.9rem",
    fontFamily: "inherit",
    outline: "none",
    cursor: "pointer",
  },
  typeRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 8,
    marginBottom: 10,
  },
  typeBtn: (active: boolean, type: "expense" | "income"): React.CSSProperties => ({
    padding: "10px",
    borderRadius: 12,
    border: `1.5px solid ${active ? (type === "expense" ? "rgba(255,99,99,0.50)" : "rgba(100,255,180,0.50)") : "rgba(255,255,255,0.10)"}`,
    background: active
      ? (type === "expense" ? "rgba(255,69,58,0.15)" : "rgba(100,255,180,0.12)")
      : "rgba(255,255,255,0.04)",
    color: active
      ? (type === "expense" ? "#ff6363" : "#64ffb4")
      : "rgba(208,224,255,0.50)",
    fontWeight: 700,
    fontSize: "0.85rem",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.18s ease",
  }),
  submitBtn: (disabled: boolean): React.CSSProperties => ({
    width: "100%",
    padding: "13px",
    borderRadius: 14,
    border: `1.5px solid ${disabled ? "rgba(100,210,255,0.08)" : "rgba(100,210,255,0.35)"}`,
    background: disabled
      ? "rgba(100,210,255,0.10)"
      : "linear-gradient(135deg, rgba(100,210,255,0.30), rgba(127,240,182,0.20))",
    color: disabled ? "rgba(208,224,255,0.30)" : "#64d2ff",
    fontWeight: 700,
    fontSize: "0.95rem",
    cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: "inherit",
    marginTop: 12,
    transition: "all 0.2s ease",
  }),
  list: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 12,
  },
  card: (isActive: boolean): React.CSSProperties => ({
    background: "rgba(10,16,30,0.80)",
    border: `1px solid ${isActive ? "rgba(100,210,255,0.20)" : "rgba(255,255,255,0.06)"}`,
    borderRadius: 20,
    padding: "16px",
    backdropFilter: "blur(16px)",
    opacity: isActive ? 1 : 0.55,
    transition: "opacity 0.2s ease",
  }),
  cardTop: {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 10,
  },
  freqBadge: (type: string): React.CSSProperties => ({
    width: 40,
    height: 40,
    borderRadius: 12,
    background: type === "income"
      ? "rgba(100,255,180,0.12)"
      : "rgba(255,99,99,0.12)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.1rem",
    flexShrink: 0,
  }),
  cardInfo: {
    flex: 1,
    minWidth: 0,
  },
  cardLabel: {
    fontSize: "0.95rem",
    fontWeight: 700,
    color: "#f6fbff",
    marginBottom: 2,
    whiteSpace: "nowrap" as const,
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  cardMeta: {
    fontSize: "0.75rem",
    color: "rgba(208,224,255,0.45)",
  },
  cardAmount: (type: string): React.CSSProperties => ({
    fontSize: "1.1rem",
    fontWeight: 800,
    color: type === "income" ? "#64ffb4" : "#ff6363",
    letterSpacing: "-0.02em",
    flexShrink: 0,
  }),
  cardBottom: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  nextChip: {
    fontSize: "0.72rem",
    fontWeight: 700,
    color: "rgba(100,210,255,0.70)",
    background: "rgba(100,210,255,0.08)",
    borderRadius: 8,
    padding: "3px 8px",
    border: "1px solid rgba(100,210,255,0.15)",
  },
  actions: {
    display: "flex",
    gap: 6,
  },
  actionBtn: (danger?: boolean): React.CSSProperties => ({
    padding: "5px 10px",
    borderRadius: 9,
    border: `1px solid ${danger ? "rgba(255,99,99,0.25)" : "rgba(255,255,255,0.12)"}`,
    background: danger ? "rgba(255,69,58,0.08)" : "rgba(255,255,255,0.05)",
    color: danger ? "rgba(255,99,99,0.80)" : "rgba(208,224,255,0.60)",
    fontSize: "0.72rem",
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.15s ease",
  }),
  empty: {
    textAlign: "center" as const,
    padding: "48px 24px",
    color: "rgba(208,224,255,0.35)",
  },
  emptyEmoji: {
    fontSize: "2.5rem",
    marginBottom: 12,
  },
  emptyText: {
    fontSize: "0.9rem",
    fontWeight: 600,
  },
};

export default function RecurringPage() {
  const [items, setItems] = useState<RecurringItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"expense" | "income">("expense");
  const [frequency, setFrequency] = useState("monthly");
  const [category, setCategory] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]!);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    try {
      const res = await fetch("/api/recurring-transactions");
      if (res.ok) {
        const data = (await res.json()) as { items: RecurringItem[] };
        setItems(data.items);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const handleSubmit = async () => {
    if (!label.trim() || !amount || parseFloat(amount) <= 0) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/recurring-transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: label.trim(),
          amount: parseFloat(amount),
          type,
          frequency,
          category: category || undefined,
          startDate,
        }),
      });
      if (res.ok) {
        setLabel("");
        setAmount("");
        setCategory("");
        setShowForm(false);
        await load();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id: string) => {
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, isActive: !i.isActive } : i));
    await fetch(`/api/recurring-transactions/${id}`, { method: "PATCH" });
    await load();
  };

  const handleDelete = async (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    await fetch(`/api/recurring-transactions/${id}`, { method: "DELETE" });
  };

  const isFormValid = label.trim().length > 0 && parseFloat(amount) > 0;

  const totalMonthly = items
    .filter((i) => i.isActive)
    .reduce((sum, i) => {
      const monthly = (() => {
        switch (i.frequency) {
          case "weekly": return i.amount * 4.33;
          case "biweekly": return i.amount * 2.17;
          case "monthly": return i.amount;
          case "quarterly": return i.amount / 3;
          case "yearly": return i.amount / 12;
          default: return 0;
        }
      })();
      return sum + (i.type === "income" ? monthly : -monthly);
    }, 0);

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div style={s.title}>🔄 Récurrents</div>
        <div style={s.subtitle}>Dépenses & revenus automatiques</div>
      </div>

      {/* Summary chip */}
      {items.length > 0 && (
        <div style={{
          background: totalMonthly >= 0 ? "rgba(100,255,180,0.08)" : "rgba(255,69,58,0.08)",
          border: `1px solid ${totalMonthly >= 0 ? "rgba(100,255,180,0.20)" : "rgba(255,99,99,0.20)"}`,
          borderRadius: 16,
          padding: "12px 16px",
          marginBottom: 20,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <span style={{ fontSize: "0.80rem", fontWeight: 600, color: "rgba(208,224,255,0.55)" }}>
            Impact mensuel net
          </span>
          <span style={{
            fontSize: "1.1rem",
            fontWeight: 800,
            color: totalMonthly >= 0 ? "#64ffb4" : "#ff6363",
            letterSpacing: "-0.02em",
          }}>
            {totalMonthly >= 0 ? "+" : ""}{totalMonthly.toFixed(2)} €
          </span>
        </div>
      )}

      {/* Add button */}
      <button
        type="button"
        onClick={() => setShowForm((v) => !v)}
        style={{
          width: "100%",
          padding: "12px",
          borderRadius: 16,
          border: "1.5px dashed rgba(100,210,255,0.30)",
          background: showForm ? "rgba(100,210,255,0.08)" : "transparent",
          color: "rgba(100,210,255,0.70)",
          fontWeight: 700,
          fontSize: "0.90rem",
          cursor: "pointer",
          fontFamily: "inherit",
          marginBottom: 16,
          transition: "all 0.2s ease",
        }}
      >
        {showForm ? "✕ Annuler" : "+ Ajouter une récurrence"}
      </button>

      {/* Add form */}
      {showForm && (
        <div style={s.addCard}>
          <div style={s.addTitle}>Nouvelle récurrence</div>

          <div style={{ marginBottom: 10 }}>
            <label style={s.label}>Libellé</label>
            <input
              style={s.input}
              placeholder="Ex: Loyer, Netflix, Salaire…"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </div>

          <div style={s.row2}>
            <div>
              <label style={s.label}>Montant (€)</label>
              <input
                style={s.input}
                type="number"
                placeholder="0.00"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div>
              <label style={s.label}>Catégorie</label>
              <select style={s.select} value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">Sans catégorie</option>
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 10 }}>
            <label style={s.label}>Type</label>
            <div style={s.typeRow}>
              <button type="button" style={s.typeBtn(type === "expense", "expense")} onClick={() => setType("expense")}>
                💸 Dépense
              </button>
              <button type="button" style={s.typeBtn(type === "income", "income")} onClick={() => setType("income")}>
                💰 Revenu
              </button>
            </div>
          </div>

          <div style={s.row2}>
            <div>
              <label style={s.label}>Fréquence</label>
              <select style={s.select} value={frequency} onChange={(e) => setFrequency(e.target.value)}>
                <option value="weekly">Hebdomadaire</option>
                <option value="biweekly">Bi-mensuel</option>
                <option value="monthly">Mensuel</option>
                <option value="quarterly">Trimestriel</option>
                <option value="yearly">Annuel</option>
              </select>
            </div>
            <div>
              <label style={s.label}>Début</label>
              <input
                style={s.input}
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
          </div>

          <button
            type="button"
            style={s.submitBtn(!isFormValid || submitting)}
            onClick={handleSubmit}
            disabled={!isFormValid || submitting}
          >
            {submitting ? "Enregistrement…" : "✓ Enregistrer"}
          </button>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div style={s.empty}>
          <div style={s.emptyEmoji}>⏳</div>
          <div style={s.emptyText}>Chargement…</div>
        </div>
      ) : items.length === 0 ? (
        <div style={s.empty}>
          <div style={s.emptyEmoji}>🔄</div>
          <div style={s.emptyText}>Aucune récurrence encore</div>
          <div style={{ fontSize: "0.80rem", marginTop: 6, color: "rgba(208,224,255,0.30)" }}>
            Ajoutez vos dépenses fixes — loyer, abonnements, salaire…
          </div>
        </div>
      ) : (
        <div style={s.list}>
          {items.map((item) => (
            <div key={item.id} style={s.card(item.isActive)}>
              <div style={s.cardTop}>
                <div style={s.freqBadge(item.type)}>
                  {FREQUENCY_EMOJIS[item.frequency] ?? "🔄"}
                </div>
                <div style={s.cardInfo}>
                  <div style={s.cardLabel}>{item.label}</div>
                  <div style={s.cardMeta}>
                    {FREQUENCY_LABELS[item.frequency] ?? item.frequency}
                    {item.category ? ` · ${item.category}` : ""}
                    {!item.isActive ? " · En pause" : ""}
                  </div>
                </div>
                <div style={s.cardAmount(item.type)}>
                  {item.type === "expense" ? "−" : "+"}{item.amount.toFixed(2)} €
                </div>
              </div>
              <div style={s.cardBottom}>
                <span style={s.nextChip}>
                  {item.isActive ? `⏩ ${nextOccurrence(item.startDate, item.frequency)}` : "⏸ En pause"}
                </span>
                <div style={s.actions}>
                  <button
                    type="button"
                    style={s.actionBtn()}
                    onClick={() => handleToggle(item.id)}
                  >
                    {item.isActive ? "Pause" : "Activer"}
                  </button>
                  <button
                    type="button"
                    style={s.actionBtn(true)}
                    onClick={() => handleDelete(item.id)}
                  >
                    Suppr.
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
