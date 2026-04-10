"use client";

import React, { useCallback, useEffect, useState } from "react";
import { ConfirmDialog } from "../_components/confirm-dialog";

interface SavingsGoal {
  id: string;
  label: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string | null;
  currency: string;
  emoji: string | null;
}

const EMOJI_OPTIONS = ["🏖️", "🚗", "🏠", "💍", "✈️", "🎓", "💻", "🎸", "⛵", "🧳", "🛡️", "💰"];

function eur(n: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);
}

function daysUntil(iso: string) {
  const diff = new Date(iso).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function monthsUntil(iso: string) {
  const now = new Date();
  const target = new Date(iso);
  return Math.max(1, (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth()));
}

function goalStatus(goal: SavingsGoal): "achieved" | "on-track" | "needs-boost" | "overdue" {
  if (goal.currentAmount >= goal.targetAmount) return "achieved";
  if (!goal.targetDate) return "on-track";
  const days = daysUntil(goal.targetDate);
  if (days < 0) return "overdue";
  const months = monthsUntil(goal.targetDate);
  const remaining = goal.targetAmount - goal.currentAmount;
  const monthlyNeeded = remaining / months;
  // "on track" if monthly needed < 30% of target (arbitrary, feels reasonable)
  return monthlyNeeded < goal.targetAmount * 0.3 ? "on-track" : "needs-boost";
}

function statusTheme(status: ReturnType<typeof goalStatus>) {
  switch (status) {
    case "achieved": return { color: "#7ff0b6", label: "Atteint 🎉", bg: "rgba(127,240,182,0.10)", border: "rgba(127,240,182,0.28)" };
    case "on-track": return { color: "#64d2ff", label: "En bonne voie", bg: "rgba(100,210,255,0.10)", border: "rgba(100,210,255,0.28)" };
    case "needs-boost": return { color: "#ffd36e", label: "Effort à accélérer", bg: "rgba(255,211,110,0.10)", border: "rgba(255,211,110,0.28)" };
    case "overdue": return { color: "#ff8e87", label: "Date dépassée", bg: "rgba(255,142,135,0.10)", border: "rgba(255,142,135,0.28)" };
  }
}

export default function SavingsGoalsPage() {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Contribute drawer
  const [contributeId, setContributeId] = useState<string | null>(null);
  const [contributeAmount, setContributeAmount] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    label: "", targetAmount: "", currentAmount: "0",
    targetDate: "", emoji: "🏖️",
  });

  const load = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const res = await fetch("/api/savings-goals");
      if (!res.ok) throw new Error("Impossible de charger les objectifs.");
      const data = await res.json() as SavingsGoal[];
      setGoals(data);
    } catch (err) { setError(err instanceof Error ? err.message : "Erreur."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault(); setFormError(null);
    if (!form.label || !form.targetAmount) { setFormError("Label et montant cible requis."); return; }
    try {
      setIsSubmitting(true);
      const res = await fetch("/api/savings-goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: form.label,
          targetAmount: parseFloat(form.targetAmount),
          currentAmount: parseFloat(form.currentAmount) || 0,
          targetDate: form.targetDate || null,
          emoji: form.emoji,
        }),
      });
      if (!res.ok) { const d = await res.json() as { error: string }; throw new Error(d.error); }
      setForm({ label: "", targetAmount: "", currentAmount: "0", targetDate: "", emoji: "🏖️" });
      setIsFormOpen(false);
      await load();
    } catch (err) { setFormError(err instanceof Error ? err.message : "Erreur."); }
    finally { setIsSubmitting(false); }
  }

  async function handleContribute(goalId: string) {
    const delta = parseFloat(contributeAmount);
    if (isNaN(delta) || delta === 0) return;
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;
    try {
      setIsSaving(true);
      await fetch(`/api/savings-goals/${goalId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentAmount: Math.max(0, goal.currentAmount + delta) }),
      });
      setContributeId(null); setContributeAmount("");
      await load();
    } finally { setIsSaving(false); }
  }

  async function handleDelete(id: string) {
    try {
      setDeletingId(id);
      await fetch(`/api/savings-goals/${id}`, { method: "DELETE" });
      setGoals((prev) => prev.filter((g) => g.id !== id));
    } finally { setDeletingId(null); setPendingDeleteId(null); }
  }

  const totalSaved = goals.reduce((s, g) => s + g.currentAmount, 0);
  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
  const achieved = goals.filter((g) => g.currentAmount >= g.targetAmount).length;

  return (
    <main style={s.page}>
      <ConfirmDialog
        open={pendingDeleteId !== null}
        title="Supprimer cet objectif ?"
        description="Cet objectif d'épargne sera supprimé définitivement."
        confirmLabel="Supprimer"
        isBusy={deletingId !== null}
        onCancel={() => { if (!deletingId) setPendingDeleteId(null); }}
        onConfirm={() => { if (pendingDeleteId) void handleDelete(pendingDeleteId); }}
      />

      <div style={s.ambientGreen} />
      <div style={s.ambientBlue} />

      <div style={s.shell}>
        {/* Header */}
        <header style={s.header}>
          <div>
            <p style={s.eyebrow}>Épargne ciblée</p>
            <h1 style={s.title}>Objectifs</h1>
            <p style={s.subtitle}>Définissez vos projets, suivez leur avancement, atteignez-les.</p>
          </div>
          {!isFormOpen && (
            <button type="button" onClick={() => setIsFormOpen(true)} style={s.primaryBtn}>
              + Nouvel objectif
            </button>
          )}
        </header>

        {/* Summary */}
        {!loading && goals.length > 0 && (
          <section style={s.heroGrid}>
            <article style={s.balanceCard}>
              <p style={s.cardLabel}>Épargne totale</p>
              <h2 style={{ ...s.bigValue, color: "#7ff0b6" }}>{eur(totalSaved)}</h2>
              <p style={s.cardHint}>sur {eur(totalTarget)} visés</p>
            </article>
            <article style={s.metricCard}>
              <p style={s.cardLabel}>Objectifs actifs</p>
              <strong style={{ ...s.metricValue, color: "#64d2ff" }}>{goals.length}</strong>
            </article>
            <article style={s.metricCard}>
              <p style={s.cardLabel}>Atteints</p>
              <strong style={{ ...s.metricValue, color: achieved > 0 ? "#7ff0b6" : "rgba(208,224,255,0.45)" }}>
                {achieved} 🎉
              </strong>
            </article>
          </section>
        )}

        {/* Create form */}
        {isFormOpen && (
          <section style={s.formCard}>
            <div style={s.formHalo} />
            <h2 style={s.formTitle}>Nouvel objectif d'épargne</h2>
            <form onSubmit={handleCreate} style={s.form}>
              {/* Emoji picker */}
              <div>
                <p style={s.fieldLabel}>Icône</p>
                <div style={s.emojiRow}>
                  {EMOJI_OPTIONS.map((em) => (
                    <button
                      key={em} type="button"
                      onClick={() => setForm({ ...form, emoji: em })}
                      style={{ ...s.emojiBtn, ...(form.emoji === em ? s.emojiBtnActive : {}) }}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>
              <div style={s.formGrid}>
                <label style={s.fieldLabel}>
                  Nom de l'objectif
                  <input
                    value={form.label}
                    onChange={(e) => setForm({ ...form, label: e.target.value })}
                    placeholder="ex: Vacances à Lisbonne"
                    style={s.input}
                  />
                </label>
                <label style={s.fieldLabel}>
                  Montant cible (€)
                  <input
                    type="number" step="0.01" min="1"
                    value={form.targetAmount}
                    onChange={(e) => setForm({ ...form, targetAmount: e.target.value })}
                    placeholder="500"
                    style={s.input}
                  />
                </label>
                <label style={s.fieldLabel}>
                  Déjà épargné (€)
                  <input
                    type="number" step="0.01" min="0"
                    value={form.currentAmount}
                    onChange={(e) => setForm({ ...form, currentAmount: e.target.value })}
                    placeholder="0"
                    style={s.input}
                  />
                </label>
                <label style={s.fieldLabel}>
                  Date cible (optionnel)
                  <input
                    type="date"
                    value={form.targetDate}
                    onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
                    style={s.input}
                  />
                </label>
              </div>
              {formError && <p style={s.inlineError}>{formError}</p>}
              <div style={s.formActions}>
                <button type="submit" disabled={isSubmitting} style={s.submitBtn}>
                  {isSubmitting ? "Création…" : "Créer l'objectif"}
                </button>
                <button type="button" onClick={() => { setIsFormOpen(false); setFormError(null); }} style={s.cancelBtn}>
                  Annuler
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Goals list */}
        {loading ? (
          <div style={s.statePanel}>
            <div style={s.skeleton} /><div style={{ ...s.skeleton, width: "70%", marginTop: 12 }} />
          </div>
        ) : error ? (
          <div style={s.errorPanel}>{error}</div>
        ) : goals.length === 0 && !isFormOpen ? (
          <div style={s.statePanel}>
            <p style={s.emptyTitle}>Aucun objectif pour le moment</p>
            <p style={s.emptyBody}>Créez votre premier objectif d'épargne pour commencer à planifier vos projets.</p>
            <button type="button" onClick={() => setIsFormOpen(true)} style={s.secondaryBtn}>
              + Créer un objectif
            </button>
          </div>
        ) : (
          <div style={s.goalsList}>
            {goals.map((goal) => {
              const pct = Math.min(100, goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0);
              const status = goalStatus(goal);
              const theme = statusTheme(status);
              const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
              const days = goal.targetDate ? daysUntil(goal.targetDate) : null;
              const months = goal.targetDate && days !== null && days > 0 ? monthsUntil(goal.targetDate) : null;
              const monthlyNeeded = months ? remaining / months : null;
              const isContributing = contributeId === goal.id;

              return (
                <article key={goal.id} style={s.goalCard}>
                  {/* Top row */}
                  <div style={s.goalTop}>
                    <div style={s.goalMeta}>
                      <span style={s.goalEmoji}>{goal.emoji ?? "💰"}</span>
                      <div>
                        <p style={s.goalLabel}>{goal.label}</p>
                        {goal.targetDate && (
                          <p style={s.goalDate}>
                            {days !== null && days >= 0
                              ? `${days} jour${days !== 1 ? "s" : ""} restant${days !== 1 ? "s" : ""}`
                              : "Date dépassée"}
                          </p>
                        )}
                      </div>
                    </div>
                    <div style={s.goalAmounts}>
                      <span style={{ ...s.goalCurrent, color: theme.color }}>{eur(goal.currentAmount)}</span>
                      <span style={s.goalTarget}>/ {eur(goal.targetAmount)}</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div style={s.progressTrack}>
                    <div style={{ ...s.progressFill, width: `${pct}%`, background: theme.color }} />
                  </div>

                  {/* Stats row */}
                  <div style={s.goalStats}>
                    <span style={{ ...s.statusPill, color: theme.color, background: theme.bg, borderColor: theme.border }}>
                      {theme.label}
                    </span>
                    <span style={s.pctLabel}>{pct.toFixed(0)}%</span>
                    {remaining > 0 && <span style={s.remainLabel}>Reste {eur(remaining)}</span>}
                    {monthlyNeeded !== null && monthlyNeeded > 0 && (
                      <span style={s.monthlyHint}>{eur(monthlyNeeded)}/mois</span>
                    )}
                  </div>

                  {/* Contribute drawer */}
                  {isContributing ? (
                    <div style={s.contributeRow}>
                      <input
                        type="number" step="0.01"
                        placeholder="Montant à ajouter (négatif pour retirer)"
                        value={contributeAmount}
                        onChange={(e) => setContributeAmount(e.target.value)}
                        style={{ ...s.input, flex: 1 }}
                        autoFocus
                      />
                      <button type="button" disabled={isSaving} onClick={() => void handleContribute(goal.id)} style={s.saveBtn}>
                        {isSaving ? "…" : "Confirmer"}
                      </button>
                      <button type="button" onClick={() => { setContributeId(null); setContributeAmount(""); }} style={s.cancelSmall}>
                        Annuler
                      </button>
                    </div>
                  ) : (
                    <div style={s.goalActions}>
                      {status !== "achieved" && (
                        <button type="button" onClick={() => { setContributeId(goal.id); setContributeAmount(""); }} style={s.contributeBtn}>
                          + Épargner
                        </button>
                      )}
                      <button type="button" onClick={() => setPendingDeleteId(goal.id)} style={s.deleteBtn}>
                        Supprimer
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: {
    position: "relative",
    minHeight: "100vh",
    background: "linear-gradient(180deg, #081120 0%, #0e1831 42%, #1d1023 100%)",
    color: "#f6fbff",
    overflowX: "hidden",
    paddingBottom: 100,
  },
  ambientGreen: {
    position: "fixed", top: "-100px", right: "-100px",
    width: "400px", height: "400px", borderRadius: "999px",
    background: "radial-gradient(circle, rgba(127,240,182,0.10) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  ambientBlue: {
    position: "fixed", bottom: "-80px", left: "-80px",
    width: "360px", height: "360px", borderRadius: "999px",
    background: "radial-gradient(circle, rgba(10,132,255,0.10) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  shell: { position: "relative", maxWidth: "860px", margin: "0 auto", padding: "32px 20px" },
  header: {
    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
    gap: 16, flexWrap: "wrap", marginBottom: 28,
  },
  eyebrow: { margin: 0, color: "rgba(208,224,255,0.68)", letterSpacing: "0.14em", textTransform: "uppercase", fontSize: "0.74rem" },
  title: { margin: "8px 0 10px", fontSize: "clamp(2.4rem, 6vw, 4rem)", lineHeight: 0.95, letterSpacing: "-0.06em" },
  subtitle: { margin: 0, color: "rgba(227,236,255,0.74)", lineHeight: 1.6 },
  primaryBtn: {
    padding: "14px 20px", borderRadius: "999px",
    background: "linear-gradient(135deg, rgba(127,240,182,0.85), rgba(10,132,255,0.75))",
    color: "#fff", fontWeight: 700, fontSize: "0.95rem", border: "none", cursor: "pointer",
    boxShadow: "0 18px 42px rgba(127,240,182,0.14)", whiteSpace: "nowrap",
  },
  heroGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 },
  balanceCard: {
    borderRadius: 28, padding: 22,
    background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)",
    backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
    boxShadow: "0 22px 48px rgba(4,10,22,0.24)",
  },
  metricCard: {
    borderRadius: 28, padding: 22,
    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
    backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
  },
  cardLabel: { margin: 0, color: "rgba(208,224,255,0.68)", fontSize: "0.82rem", letterSpacing: "0.08em", textTransform: "uppercase" },
  bigValue: { margin: "14px 0 6px", fontSize: "clamp(1.8rem, 4vw, 2.6rem)", lineHeight: 0.95, letterSpacing: "-0.05em" },
  cardHint: { margin: 0, color: "rgba(227,236,255,0.6)", fontSize: "0.85rem" },
  metricValue: { display: "block", marginTop: 16, fontSize: "1.5rem", letterSpacing: "-0.04em" },
  formCard: {
    position: "relative", overflow: "hidden", borderRadius: 24, padding: 24,
    background: "linear-gradient(180deg, rgba(17,25,45,0.96), rgba(30,16,31,0.96))",
    border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 28px 80px rgba(0,0,0,0.28)",
    marginBottom: 24,
  },
  formHalo: {
    position: "absolute", top: "-60px", right: "-50px", width: "200px", height: "200px",
    borderRadius: "999px", background: "radial-gradient(circle, rgba(127,240,182,0.14) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  formTitle: { position: "relative", margin: "0 0 20px", fontSize: "1.4rem", letterSpacing: "-0.03em" },
  form: { position: "relative", display: "flex", flexDirection: "column", gap: 16 },
  fieldLabel: {
    display: "flex", flexDirection: "column", gap: 6,
    fontSize: "0.78rem", color: "rgba(208,224,255,0.68)",
    letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 600,
  },
  emojiRow: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 },
  emojiBtn: {
    width: 40, height: 40, borderRadius: 10, fontSize: "1.3rem",
    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)",
    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
  },
  emojiBtnActive: {
    background: "rgba(127,240,182,0.15)", border: "1px solid rgba(127,240,182,0.4)",
    boxShadow: "0 0 10px rgba(127,240,182,0.2)",
  },
  formGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 },
  input: {
    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 12, padding: "10px 14px", color: "#f6fbff", fontSize: "1rem", outline: "none",
    colorScheme: "dark",
  },
  inlineError: { margin: 0, color: "#ff8e87", fontSize: "0.88rem" },
  formActions: { display: "flex", gap: 10, flexWrap: "wrap" },
  submitBtn: {
    padding: "12px 20px", borderRadius: "999px",
    background: "linear-gradient(135deg, rgba(127,240,182,0.85), rgba(10,132,255,0.7))",
    color: "#fff", fontWeight: 700, fontSize: "0.95rem", border: "none", cursor: "pointer",
  },
  cancelBtn: {
    padding: "12px 20px", borderRadius: "999px",
    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.14)",
    color: "rgba(227,236,255,0.82)", fontWeight: 700, fontSize: "0.95rem", cursor: "pointer",
  },
  goalsList: { display: "flex", flexDirection: "column", gap: 14 },
  goalCard: {
    borderRadius: 24, padding: "20px 22px",
    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.11)",
    backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
    display: "flex", flexDirection: "column", gap: 12,
  },
  goalTop: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" },
  goalMeta: { display: "flex", alignItems: "center", gap: 12 },
  goalEmoji: { fontSize: "2rem", lineHeight: 1, flexShrink: 0 },
  goalLabel: { margin: 0, fontWeight: 700, fontSize: "1.05rem" },
  goalDate: { margin: "3px 0 0", fontSize: "0.78rem", color: "rgba(208,224,255,0.5)" },
  goalAmounts: { display: "flex", alignItems: "baseline", gap: 6 },
  goalCurrent: { fontSize: "1.7rem", fontWeight: 800, letterSpacing: "-0.04em" },
  goalTarget: { fontSize: "0.9rem", color: "rgba(208,224,255,0.5)" },
  progressTrack: { height: 8, borderRadius: 999, background: "rgba(255,255,255,0.08)", overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 999, transition: "width 0.5s ease" },
  goalStats: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" },
  statusPill: {
    padding: "5px 12px", borderRadius: "999px", border: "1px solid",
    fontSize: "0.78rem", fontWeight: 700,
  },
  pctLabel: { fontSize: "0.82rem", color: "rgba(208,224,255,0.55)", fontWeight: 600 },
  remainLabel: { fontSize: "0.82rem", color: "rgba(208,224,255,0.45)" },
  monthlyHint: {
    marginLeft: "auto", fontSize: "0.82rem", color: "#ffd36e",
    fontWeight: 600, background: "rgba(255,211,110,0.10)",
    padding: "4px 10px", borderRadius: 999, border: "1px solid rgba(255,211,110,0.25)",
  },
  contributeRow: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" },
  saveBtn: {
    padding: "10px 16px", borderRadius: "999px",
    background: "rgba(127,240,182,0.15)", border: "1px solid rgba(127,240,182,0.35)",
    color: "#7ff0b6", fontWeight: 700, fontSize: "0.88rem", cursor: "pointer", whiteSpace: "nowrap",
  },
  cancelSmall: {
    padding: "10px 16px", borderRadius: "999px",
    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
    color: "rgba(227,236,255,0.7)", fontWeight: 600, fontSize: "0.88rem", cursor: "pointer",
  },
  goalActions: { display: "flex", gap: 10, alignItems: "center" },
  contributeBtn: {
    padding: "9px 16px", borderRadius: "999px",
    background: "rgba(127,240,182,0.10)", border: "1px solid rgba(127,240,182,0.28)",
    color: "#7ff0b6", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer",
  },
  deleteBtn: {
    background: "none", border: "none", color: "rgba(255,142,135,0.55)",
    fontSize: "0.82rem", fontWeight: 600, cursor: "pointer", padding: 0, marginLeft: "auto",
  },
  statePanel: { borderRadius: 22, padding: 28, background: "rgba(8,14,29,0.36)", color: "rgba(227,236,255,0.82)" },
  errorPanel: { borderRadius: 22, padding: 20, background: "rgba(119,24,31,0.42)", border: "1px solid rgba(255,255,255,0.12)", color: "#ffe8ea" },
  emptyTitle: { margin: 0, fontSize: "1.05rem", fontWeight: 700 },
  emptyBody: { margin: "8px 0 18px", lineHeight: 1.6, color: "rgba(227,236,255,0.72)" },
  secondaryBtn: {
    display: "inline-flex", padding: "12px 18px", borderRadius: "999px",
    background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)",
    color: "#f6fbff", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer",
  },
  skeleton: { height: 16, width: "100%", borderRadius: 8, background: "rgba(255,255,255,0.06)" },
};
