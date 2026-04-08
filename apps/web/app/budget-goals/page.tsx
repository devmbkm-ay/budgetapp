"use client";

import React, { useState, useEffect } from "react";
import { ConfirmDialog } from "../_components/confirm-dialog";

interface BudgetGoal {
  id: string;
  category: string;
  limitAmount: number;
  period: "monthly" | "weekly" | "yearly";
}

interface BudgetGoalWithSpent extends BudgetGoal {
  spent: number;
  percentUsed: number;
}

const CATEGORIES = [
  "Alimentaire",
  "Restaurants",
  "Cafés & Bars",
  "Transport",
  "Vêtements",
  "Électronique",
  "Divertissement",
  "Loisirs & Sports",
  "Santé",
  "Éducation",
  "Logement",
  "Utilitaires",
];

const PERIODS = [
  { value: "weekly", label: "Par semaine" },
  { value: "monthly", label: "Par mois" },
  { value: "yearly", label: "Par année" },
] as const;

const CATEGORY_EMOJI: Record<string, string> = {
  "Alimentaire": "🛒",
  "Restaurants": "🍽️",
  "Cafés & Bars": "☕",
  "Transport": "🚗",
  "Vêtements": "👕",
  "Électronique": "💻",
  "Divertissement": "🎬",
  "Loisirs & Sports": "⚽",
  "Santé": "🏥",
  "Éducation": "📚",
  "Logement": "🏠",
  "Utilitaires": "💡",
};

function getProgressColor(pct: number) {
  if (pct >= 100) return "#ff8e87";
  if (pct >= 80) return "#ffc87a";
  return "#7ff0b6";
}

function getStatusLabel(pct: number) {
  if (pct >= 100) return "Dépassé";
  if (pct >= 80) return "Attention";
  return "OK";
}

function formatEur(amount: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(amount);
}

export default function BudgetGoalsPage() {
  const [goals, setGoals] = useState<BudgetGoalWithSpent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    category: "",
    limitAmount: "",
    period: "monthly" as "monthly" | "weekly" | "yearly",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { void fetchGoals(); }, []);

  async function fetchGoals() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/budget-goals");
      if (!res.ok) throw new Error("Impossible de charger les budgets.");
      const data = await res.json();
      setGoals(data.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateGoal(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!formData.category || !formData.limitAmount) {
      setFormError("Veuillez remplir tous les champs.");
      return;
    }
    try {
      setIsSubmitting(true);
      const res = await fetch("/api/budget-goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: formData.category,
          limitAmount: parseFloat(formData.limitAmount),
          period: formData.period,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Erreur lors de la création.");
      }
      setFormData({ category: "", limitAmount: "", period: "monthly" });
      setIsFormOpen(false);
      await fetchGoals();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Erreur.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteGoal(goalId: string) {
    try {
      setDeletingId(goalId);
      const res = await fetch(`/api/budget-goals/${goalId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Impossible de supprimer ce budget.");
      setGoals((prev) => prev.filter((g) => g.id !== goalId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur.");
    } finally {
      setDeletingId(null);
      setPendingDeleteId(null);
    }
  }

  const totalBudget = goals.reduce((s, g) => s + g.limitAmount, 0);
  const totalSpent = goals.reduce((s, g) => s + g.spent, 0);
  const overBudget = goals.filter((g) => g.percentUsed >= 100).length;

  return (
    <main style={styles.page}>
      <ConfirmDialog
        open={pendingDeleteId !== null}
        title="Supprimer ce budget ?"
        description="Ce budget et son suivi de dépenses seront retirés. Cette action est irréversible."
        confirmLabel="Supprimer"
        isBusy={deletingId !== null}
        onCancel={() => { if (!deletingId) setPendingDeleteId(null); }}
        onConfirm={() => { if (pendingDeleteId) void handleDeleteGoal(pendingDeleteId); }}
      />

      <div style={styles.ambientBlue} />
      <div style={styles.ambientCoral} />

      <div style={styles.shell}>
        {/* Header */}
        <header style={styles.header}>
          <div>
            <p style={styles.eyebrow}>Contrôle des dépenses</p>
            <h1 style={styles.title}>Budgets</h1>
            <p style={styles.subtitle}>Définissez vos limites par catégorie et suivez votre progression en temps réel.</p>
          </div>
          {!isFormOpen && (
            <button type="button" onClick={() => setIsFormOpen(true)} style={styles.primaryAction}>
              + Ajouter un budget
            </button>
          )}
        </header>

        {/* Summary cards */}
        {!loading && goals.length > 0 && (
          <section style={styles.heroGrid}>
            <article style={styles.balanceCard}>
              <p style={styles.cardLabel}>Budget total</p>
              <h2 style={{ ...styles.balanceValue, color: "#f6fbff" }}>{formatEur(totalBudget)}</h2>
              <p style={styles.balanceHint}>{goals.length} budget{goals.length > 1 ? "s" : ""} actif{goals.length > 1 ? "s" : ""}</p>
            </article>
            <article style={styles.metricCard}>
              <p style={styles.cardLabel}>Dépensé</p>
              <strong style={{ ...styles.metricValue, color: totalSpent > totalBudget ? "#ff8e87" : "#7ff0b6" }}>
                {formatEur(totalSpent)}
              </strong>
            </article>
            <article style={styles.metricCard}>
              <p style={styles.cardLabel}>Dépassements</p>
              <strong style={{ ...styles.metricValue, color: overBudget > 0 ? "#ff8e87" : "#7ff0b6" }}>
                {overBudget} budget{overBudget !== 1 ? "s" : ""}
              </strong>
            </article>
          </section>
        )}

        {/* Create form */}
        {isFormOpen && (
          <section style={styles.formCard}>
            <div style={styles.formCardHalo} />
            <h2 style={styles.formTitle}>Nouveau budget</h2>
            <form onSubmit={handleCreateGoal} style={styles.form}>
              <div style={styles.formGrid}>
                <label style={styles.fieldLabel}>
                  Catégorie
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={styles.select}
                  >
                    <option value="">Sélectionner…</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{CATEGORY_EMOJI[cat]} {cat}</option>
                    ))}
                  </select>
                </label>
                <label style={styles.fieldLabel}>
                  Limite (€)
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.limitAmount}
                    onChange={(e) => setFormData({ ...formData, limitAmount: e.target.value })}
                    placeholder="0,00"
                    style={styles.input}
                  />
                </label>
                <label style={styles.fieldLabel}>
                  Période
                  <select
                    value={formData.period}
                    onChange={(e) => setFormData({ ...formData, period: e.target.value as typeof formData.period })}
                    style={styles.select}
                  >
                    {PERIODS.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </label>
              </div>
              {formError && <p style={styles.errorInline}>{formError}</p>}
              <div style={styles.formActions}>
                <button type="submit" disabled={isSubmitting} style={styles.submitBtn}>
                  {isSubmitting ? "Création…" : "Créer le budget"}
                </button>
                <button
                  type="button"
                  onClick={() => { setIsFormOpen(false); setFormData({ category: "", limitAmount: "", period: "monthly" }); setFormError(null); }}
                  style={styles.cancelBtn}
                >
                  Annuler
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Goals list */}
        <section style={styles.listShell}>
          <div style={styles.listHeader}>
            <h2 style={styles.listTitle}>Mes budgets</h2>
            {!loading && <span style={styles.countPill}>{goals.length} budget{goals.length !== 1 ? "s" : ""}</span>}
          </div>

          {loading ? (
            <div style={styles.statePanel}>
              <div style={styles.skeletonRow} />
              <div style={{ ...styles.skeletonRow, width: "70%", marginTop: 12 }} />
              <div style={{ ...styles.skeletonRow, width: "85%", marginTop: 12 }} />
            </div>
          ) : error ? (
            <div style={styles.errorPanel}>
              <strong style={styles.emptyTitle}>Erreur</strong>
              <p style={{ margin: 0 }}>{error}</p>
            </div>
          ) : goals.length === 0 ? (
            <div style={styles.statePanel}>
              <p style={styles.emptyTitle}>Aucun budget défini</p>
              <p style={styles.emptyBody}>Créez votre premier budget pour commencer à contrôler vos dépenses par catégorie.</p>
              <button type="button" onClick={() => setIsFormOpen(true)} style={styles.secondaryAction}>
                + Créer un budget
              </button>
            </div>
          ) : (
            <div style={styles.goalsList}>
              {goals.map((goal) => {
                const pct = Math.min(goal.percentUsed, 100);
                const color = getProgressColor(goal.percentUsed);
                return (
                  <article key={goal.id} style={styles.goalCard}>
                    <div style={styles.goalTop}>
                      <div style={styles.goalMeta}>
                        <span style={styles.goalEmoji}>{CATEGORY_EMOJI[goal.category] ?? "📦"}</span>
                        <div>
                          <p style={styles.goalCategory}>{goal.category}</p>
                          <p style={styles.goalPeriod}>{PERIODS.find((p) => p.value === goal.period)?.label}</p>
                        </div>
                      </div>
                      <div style={styles.goalAmounts}>
                        <span style={{ ...styles.goalSpent, color }}>{formatEur(goal.spent)}</span>
                        <span style={styles.goalLimit}>/ {formatEur(goal.limitAmount)}</span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div style={styles.progressTrack}>
                      <div style={{ ...styles.progressFill, width: `${pct}%`, background: color }} />
                    </div>

                    <div style={styles.goalFooter}>
                      <span style={{ ...styles.statusPill, color, borderColor: `${color}40`, background: `${color}12` }}>
                        {goal.percentUsed.toFixed(0)}% — {getStatusLabel(goal.percentUsed)}
                      </span>
                      <button
                        type="button"
                        onClick={() => setPendingDeleteId(goal.id)}
                        style={styles.deleteBtn}
                      >
                        Supprimer
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    position: "relative",
    minHeight: "100vh",
    background: "linear-gradient(180deg, #081120 0%, #0e1831 42%, #1d1023 100%)",
    color: "#f6fbff",
    overflowX: "hidden",
    paddingBottom: 100,
  },
  ambientBlue: {
    position: "fixed",
    top: "-120px",
    left: "-120px",
    width: "480px",
    height: "480px",
    borderRadius: "999px",
    background: "radial-gradient(circle, rgba(10,132,255,0.13) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  ambientCoral: {
    position: "fixed",
    bottom: "-80px",
    right: "-80px",
    width: "360px",
    height: "360px",
    borderRadius: "999px",
    background: "radial-gradient(circle, rgba(255,69,58,0.10) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  shell: {
    position: "relative",
    maxWidth: "860px",
    margin: "0 auto",
    padding: "32px 20px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    flexWrap: "wrap",
    marginBottom: 28,
  },
  eyebrow: {
    margin: 0,
    color: "rgba(208,224,255,0.68)",
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    fontSize: "0.74rem",
  },
  title: {
    margin: "8px 0 10px",
    fontSize: "clamp(2.4rem, 6vw, 4rem)",
    lineHeight: 0.95,
    letterSpacing: "-0.06em",
  },
  subtitle: {
    margin: 0,
    maxWidth: "34rem",
    color: "rgba(227,236,255,0.74)",
    lineHeight: 1.6,
  },
  primaryAction: {
    padding: "14px 20px",
    borderRadius: "999px",
    background: "linear-gradient(135deg, rgba(255,69,58,0.95), rgba(10,132,255,0.78))",
    color: "#fff",
    fontWeight: 700,
    fontSize: "0.95rem",
    border: "none",
    cursor: "pointer",
    boxShadow: "0 18px 42px rgba(10,132,255,0.16)",
    whiteSpace: "nowrap",
  },
  heroGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 16,
    marginBottom: 24,
  },
  balanceCard: {
    borderRadius: 28,
    padding: 22,
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.14)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    boxShadow: "0 22px 48px rgba(4,10,22,0.24)",
  },
  metricCard: {
    borderRadius: 28,
    padding: 22,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
  },
  cardLabel: {
    margin: 0,
    color: "rgba(208,224,255,0.68)",
    fontSize: "0.82rem",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  balanceValue: {
    margin: "14px 0 10px",
    fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
    lineHeight: 0.95,
    letterSpacing: "-0.06em",
  },
  balanceHint: {
    margin: 0,
    color: "rgba(227,236,255,0.76)",
    fontSize: "0.9rem",
  },
  metricValue: {
    display: "block",
    marginTop: 16,
    fontSize: "1.5rem",
    letterSpacing: "-0.04em",
  },
  formCard: {
    position: "relative",
    overflow: "hidden",
    borderRadius: 24,
    padding: "24px",
    background: "linear-gradient(180deg, rgba(17,25,45,0.96), rgba(30,16,31,0.96))",
    border: "1px solid rgba(255,255,255,0.12)",
    boxShadow: "0 28px 80px rgba(0,0,0,0.28)",
    marginBottom: 24,
  },
  formCardHalo: {
    position: "absolute",
    top: "-60px",
    right: "-50px",
    width: "200px",
    height: "200px",
    borderRadius: "999px",
    background: "radial-gradient(circle, rgba(10,132,255,0.18) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  formTitle: {
    position: "relative",
    margin: "0 0 20px",
    fontSize: "1.4rem",
    letterSpacing: "-0.03em",
  },
  form: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 14,
  },
  fieldLabel: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    fontSize: "0.82rem",
    color: "rgba(208,224,255,0.68)",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    fontWeight: 600,
  },
  input: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 12,
    padding: "10px 14px",
    color: "#f6fbff",
    fontSize: "1rem",
    outline: "none",
  },
  select: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 12,
    padding: "10px 14px",
    color: "#f6fbff",
    fontSize: "1rem",
    outline: "none",
  },
  errorInline: {
    margin: 0,
    color: "#ff8e87",
    fontSize: "0.88rem",
  },
  formActions: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  submitBtn: {
    padding: "12px 20px",
    borderRadius: "999px",
    background: "linear-gradient(135deg, rgba(59,130,246,0.9), rgba(127,240,182,0.75))",
    color: "#fff",
    fontWeight: 700,
    fontSize: "0.95rem",
    border: "none",
    cursor: "pointer",
  },
  cancelBtn: {
    padding: "12px 20px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.14)",
    color: "rgba(227,236,255,0.82)",
    fontWeight: 700,
    fontSize: "0.95rem",
    cursor: "pointer",
  },
  listShell: {
    borderRadius: 30,
    padding: "22px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    backdropFilter: "blur(22px)",
    WebkitBackdropFilter: "blur(22px)",
  },
  listHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
    flexWrap: "wrap",
    gap: 10,
  },
  listTitle: {
    margin: 0,
    fontSize: "1.4rem",
    letterSpacing: "-0.04em",
  },
  countPill: {
    padding: "8px 14px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.08)",
    color: "rgba(227,236,255,0.82)",
    fontSize: "0.88rem",
  },
  goalsList: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  goalCard: {
    borderRadius: 20,
    padding: "18px 20px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.09)",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  goalTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  goalMeta: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  goalEmoji: {
    fontSize: "1.6rem",
    lineHeight: 1,
  },
  goalCategory: {
    margin: 0,
    fontWeight: 700,
    fontSize: "1rem",
  },
  goalPeriod: {
    margin: "2px 0 0",
    fontSize: "0.82rem",
    color: "rgba(208,224,255,0.55)",
  },
  goalAmounts: {
    display: "flex",
    alignItems: "baseline",
    gap: 6,
  },
  goalSpent: {
    fontSize: "1.6rem",
    fontWeight: 700,
    letterSpacing: "-0.04em",
  },
  goalLimit: {
    fontSize: "0.9rem",
    color: "rgba(208,224,255,0.55)",
  },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    background: "rgba(255,255,255,0.08)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    transition: "width 0.4s ease",
  },
  goalFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  statusPill: {
    padding: "6px 12px",
    borderRadius: "999px",
    border: "1px solid",
    fontSize: "0.82rem",
    fontWeight: 700,
  },
  deleteBtn: {
    background: "none",
    border: "none",
    color: "rgba(255,142,135,0.6)",
    fontSize: "0.82rem",
    fontWeight: 600,
    cursor: "pointer",
    padding: 0,
  },
  statePanel: {
    borderRadius: 22,
    padding: 28,
    background: "rgba(8,14,29,0.36)",
    color: "rgba(227,236,255,0.82)",
  },
  errorPanel: {
    display: "grid",
    gap: 6,
    borderRadius: 22,
    padding: 20,
    background: "rgba(119,24,31,0.42)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "#ffe8ea",
  },
  emptyTitle: {
    margin: 0,
    fontSize: "1.05rem",
    fontWeight: 700,
  },
  emptyBody: {
    margin: "8px 0 18px",
    lineHeight: 1.6,
    color: "rgba(227,236,255,0.72)",
  },
  secondaryAction: {
    display: "inline-flex",
    padding: "12px 18px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.14)",
    color: "#f6fbff",
    fontWeight: 700,
    fontSize: "0.9rem",
    cursor: "pointer",
  },
  skeletonRow: {
    height: 16,
    width: "100%",
    borderRadius: 8,
    background: "rgba(255,255,255,0.06)",
    animation: "pulse 1.5s ease-in-out infinite",
  },
};
