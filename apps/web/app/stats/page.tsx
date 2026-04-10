"use client";

import React, { useEffect, useState, type CSSProperties } from "react";

interface ForecastSummary {
  averageDailyExpense: number;
  projectedEndBalance: number;
  projectedMonthExpense: number;
  status: "stable" | "watch" | "risky";
}

interface TotalsSummary {
  balance: number;
  expenses: number;
  income: number;
}

interface PeriodSummary {
  daysElapsed: number;
  month: string;
  totalDays: number;
}

interface CategorySummary {
  amount: number;
  category: string;
  pressure: "low" | "medium" | "high";
  share: number;
}

interface ComparisonDelta {
  direction: "down" | "flat" | "up";
  value: number;
}

interface ComparisonSummary {
  expenseDelta: ComparisonDelta;
  incomeDelta: ComparisonDelta;
  previousMonth: string;
  topImprovementCategory: string | null;
  topRisingCategory: string | null;
}

interface AssistantInsight {
  body: string;
  id: string;
  title: string;
  tone: "positive" | "neutral" | "warning";
}

interface InsightsSummary {
  categories: CategorySummary[];
  comparison: ComparisonSummary;
  forecast: ForecastSummary;
  insights: AssistantInsight[];
  period: PeriodSummary;
  totals: TotalsSummary;
}

function eur(n: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);
}

function statusTheme(status: "stable" | "watch" | "risky") {
  if (status === "risky") return { color: "#ff8e87", bg: "rgba(255,142,135,0.10)", border: "rgba(255,142,135,0.30)", label: "Sous tension" };
  if (status === "watch") return { color: "#ffd36e", bg: "rgba(255,211,110,0.10)", border: "rgba(255,211,110,0.30)", label: "À surveiller" };
  return { color: "#7ff0b6", bg: "rgba(127,240,182,0.10)", border: "rgba(127,240,182,0.30)", label: "Stable" };
}

function deltaArrow(dir: "up" | "down" | "flat", isExpense: boolean) {
  if (dir === "flat") return { symbol: "→", color: "#64d2ff" };
  const up = dir === "up";
  // For expenses: up is bad (red), down is good (green). For income: up is good, down is bad.
  const good = isExpense ? !up : up;
  return { symbol: up ? "↑" : "↓", color: good ? "#7ff0b6" : "#ff8e87" };
}

export default function StatsPage() {
  const [data, setData] = useState<InsightsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/insights/summary");
        if (!res.ok) throw new Error("Impossible de charger les données.");
        const json = await res.json() as InsightsSummary;
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue.");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  if (loading) {
    return (
      <div style={s.loadingPage}>
        <div style={s.spinner} />
        <p style={{ margin: 0, color: "#64d2ff", fontSize: "0.9rem" }}>Analyse en cours…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !data) {
    return (
      <main style={s.page}>
        <div style={s.shell}>
          <div style={s.errorPanel}>{error ?? "Erreur de chargement."}</div>
        </div>
      </main>
    );
  }

  const { forecast, totals, period, categories, comparison } = data;
  const theme = statusTheme(forecast.status);
  const monthPct = Math.round((period.daysElapsed / period.totalDays) * 100);
  const expensePct = totals.income > 0 ? Math.min(100, (totals.expenses / totals.income) * 100) : 0;
  const projectedPct = totals.income > 0 ? Math.min(100, (forecast.projectedMonthExpense / totals.income) * 100) : 0;
  const daysLeft = period.totalDays - period.daysElapsed;

  const expArrow = deltaArrow(comparison.expenseDelta.direction, true);
  const incArrow = deltaArrow(comparison.incomeDelta.direction, false);

  const prevMonthLabel = comparison.previousMonth
    ? new Date(comparison.previousMonth + "-01").toLocaleDateString("fr-FR", { month: "long" })
    : "";

  return (
    <main style={s.page}>
      <div style={s.ambientBlue} />
      <div style={s.ambientGold} />

      <div style={s.shell}>
        {/* Header */}
        <header style={s.header}>
          <div>
            <p style={s.eyebrow}>Prévision mensuelle</p>
            <h1 style={s.title}>Intelligence Financière</h1>
            <p style={s.subtitle}>Analyse prédictive de vos comportements de dépenses.</p>
          </div>
          <span style={{ ...s.statusBadge, color: theme.color, background: theme.bg, borderColor: theme.border }}>
            {theme.label}
          </span>
        </header>

        {/* Hero — projected end-of-month balance */}
        <section style={s.heroCard}>
          <div style={{ ...s.heroHalo, background: `radial-gradient(circle, ${theme.color}22 0%, transparent 70%)` }} />
          <p style={s.heroLabel}>Solde projeté fin de mois</p>
          <h2 style={{ ...s.heroValue, color: theme.color }}>{eur(forecast.projectedEndBalance)}</h2>
          <p style={s.heroHint}>
            Si vous continuez au rythme actuel de {eur(forecast.averageDailyExpense)}/jour
          </p>

          {/* Month progress timeline */}
          <div style={s.timelineRow}>
            <span style={s.timelineLabel}>1er {period.month.split("-")[1] === "01" ? "jan" : ""}</span>
            <div style={s.timelineTrack}>
              <div style={{ ...s.timelineFill, width: `${monthPct}%` }} />
              {/* Today marker */}
              <div style={{ ...s.todayMarker, left: `${monthPct}%` }} />
            </div>
            <span style={s.timelineLabel}>J{period.totalDays}</span>
          </div>
          <p style={s.timelineHint}>
            Jour {period.daysElapsed} sur {period.totalDays} — {daysLeft} jour{daysLeft !== 1 ? "s" : ""} restant{daysLeft !== 1 ? "s" : ""}
          </p>
        </section>

        {/* Metric cards */}
        <div style={s.metricsGrid}>
          <div style={s.metricCard}>
            <p style={s.metricLabel}>🔥 Burn rate</p>
            <p style={s.metricValue}>{eur(forecast.averageDailyExpense)}<span style={s.metricUnit}>/jour</span></p>
            <p style={s.metricHint}>Sur {period.daysElapsed} jours</p>
          </div>
          <div style={s.metricCard}>
            <p style={s.metricLabel}>📅 Jours restants</p>
            <p style={{ ...s.metricValue, color: "#64d2ff" }}>{daysLeft}<span style={s.metricUnit}> jours</span></p>
            <p style={s.metricHint}>{eur(forecast.averageDailyExpense * daysLeft)} estimé</p>
          </div>
          <div style={s.metricCard}>
            <p style={s.metricLabel}>🎯 Projection totale</p>
            <p style={{ ...s.metricValue, color: forecast.projectedMonthExpense > totals.income ? "#ff8e87" : "#ffd36e" }}>
              {eur(forecast.projectedMonthExpense)}
            </p>
            <p style={s.metricHint}>vs {eur(totals.income)} revenus</p>
          </div>
        </div>

        {/* Income vs expense bar */}
        <section style={s.panel}>
          <p style={s.panelLabel}>Capacité budgétaire</p>
          <div style={s.barGroup}>
            <div style={s.barRow}>
              <span style={s.barRowLabel}>Dépensé</span>
              <div style={s.barTrack}>
                <div style={{ ...s.barFill, width: `${expensePct}%`, background: expensePct >= 90 ? "#ff8e87" : expensePct >= 70 ? "#ffd36e" : "#7ff0b6" }} />
              </div>
              <span style={s.barRowValue}>{expensePct.toFixed(0)}%</span>
            </div>
            <div style={s.barRow}>
              <span style={s.barRowLabel}>Projeté</span>
              <div style={s.barTrack}>
                <div style={{ ...s.barFill, width: `${projectedPct}%`, background: projectedPct >= 100 ? "#ff8e87" : "#ffd36e", opacity: 0.7 }} />
              </div>
              <span style={s.barRowValue}>{projectedPct.toFixed(0)}%</span>
            </div>
          </div>
          <div style={s.barLegend}>
            <span style={s.barLegendItem}><span style={{ color: "#7ff0b6" }}>●</span> Actuel {eur(totals.expenses)}</span>
            <span style={s.barLegendItem}><span style={{ color: "#ffd36e" }}>●</span> Projeté {eur(forecast.projectedMonthExpense)}</span>
            <span style={s.barLegendItem}><span style={{ color: "#64d2ff" }}>●</span> Revenus {eur(totals.income)}</span>
          </div>
        </section>

        {/* Category breakdown */}
        {categories.length > 0 && (
          <section style={s.panel}>
            <p style={s.panelLabel}>Catégories dominantes</p>
            <div style={s.catList}>
              {categories.map((cat) => {
                const pressureColor = cat.pressure === "high" ? "#ff8e87" : cat.pressure === "medium" ? "#ffd36e" : "#7ff0b6";
                return (
                  <div key={cat.category} style={s.catRow}>
                    <div style={s.catMeta}>
                      <span style={s.catName}>{cat.category}</span>
                      <span style={{ ...s.catPressure, color: pressureColor, borderColor: `${pressureColor}40`, background: `${pressureColor}12` }}>
                        {cat.pressure === "high" ? "Élevé" : cat.pressure === "medium" ? "Moyen" : "OK"}
                      </span>
                    </div>
                    <div style={s.catBarTrack}>
                      <div style={{ ...s.catBarFill, width: `${cat.share * 100}%`, background: pressureColor }} />
                    </div>
                    <div style={s.catAmounts}>
                      <span style={{ color: pressureColor, fontWeight: 700, fontSize: "0.95rem" }}>{eur(cat.amount)}</span>
                      <span style={s.catShare}>{(cat.share * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Comparison vs last month */}
        <section style={s.panel}>
          <p style={s.panelLabel}>vs {prevMonthLabel || "mois dernier"}</p>
          <div style={s.compGrid}>
            <div style={s.compItem}>
              <p style={s.compLabel}>Dépenses</p>
              <p style={{ ...s.compValue, color: expArrow.color }}>
                {expArrow.symbol} {eur(comparison.expenseDelta.value)}
              </p>
              <p style={s.compHint}>
                {comparison.expenseDelta.direction === "flat" ? "Stable" :
                  comparison.expenseDelta.direction === "up" ? "en hausse" : "en baisse"}
              </p>
            </div>
            <div style={s.compItem}>
              <p style={s.compLabel}>Revenus</p>
              <p style={{ ...s.compValue, color: incArrow.color }}>
                {incArrow.symbol} {eur(comparison.incomeDelta.value)}
              </p>
              <p style={s.compHint}>
                {comparison.incomeDelta.direction === "flat" ? "Stable" :
                  comparison.incomeDelta.direction === "up" ? "en hausse" : "en baisse"}
              </p>
            </div>
            {comparison.topRisingCategory && (
              <div style={s.compItem}>
                <p style={s.compLabel}>Catégorie en hausse</p>
                <p style={{ ...s.compValue, color: "#ff8e87", fontSize: "1rem" }}>{comparison.topRisingCategory}</p>
                <p style={s.compHint}>vs mois dernier</p>
              </div>
            )}
            {comparison.topImprovementCategory && (
              <div style={s.compItem}>
                <p style={s.compLabel}>Amélioration</p>
                <p style={{ ...s.compValue, color: "#7ff0b6", fontSize: "1rem" }}>{comparison.topImprovementCategory}</p>
                <p style={s.compHint}>en baisse vs mois dernier</p>
              </div>
            )}
          </div>
        </section>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </main>
  );
}

const s: Record<string, CSSProperties> = {
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
    background: "radial-gradient(circle, rgba(10,132,255,0.12) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  ambientGold: {
    position: "fixed",
    bottom: "-80px",
    right: "-80px",
    width: "360px",
    height: "360px",
    borderRadius: "999px",
    background: "radial-gradient(circle, rgba(255,211,110,0.08) 0%, transparent 70%)",
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
    color: "rgba(227,236,255,0.74)",
    lineHeight: 1.6,
    maxWidth: "34rem",
  },
  statusBadge: {
    display: "inline-block",
    padding: "10px 18px",
    borderRadius: "999px",
    border: "1px solid",
    fontWeight: 800,
    fontSize: "0.82rem",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    flexShrink: 0,
    alignSelf: "flex-start",
    marginTop: 6,
  },
  heroCard: {
    position: "relative",
    overflow: "hidden",
    borderRadius: 28,
    padding: "28px 28px 24px",
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.13)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    boxShadow: "0 22px 60px rgba(4,10,22,0.28)",
    marginBottom: 20,
  },
  heroHalo: {
    position: "absolute",
    top: "-60px",
    right: "-60px",
    width: "260px",
    height: "260px",
    borderRadius: "999px",
    pointerEvents: "none",
  },
  heroLabel: {
    margin: "0 0 8px",
    color: "rgba(208,224,255,0.65)",
    fontSize: "0.78rem",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
  },
  heroValue: {
    margin: "0 0 8px",
    fontSize: "clamp(2.8rem, 7vw, 4.8rem)",
    lineHeight: 0.95,
    letterSpacing: "-0.06em",
    fontWeight: 800,
  },
  heroHint: {
    margin: "0 0 24px",
    color: "rgba(208,224,255,0.55)",
    fontSize: "0.88rem",
  },
  timelineRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  timelineLabel: {
    fontSize: "0.72rem",
    color: "rgba(208,224,255,0.45)",
    flexShrink: 0,
    width: 28,
    textAlign: "center",
  },
  timelineTrack: {
    flex: 1,
    height: 8,
    borderRadius: 999,
    background: "rgba(255,255,255,0.08)",
    overflow: "visible",
    position: "relative",
  },
  timelineFill: {
    height: "100%",
    borderRadius: 999,
    background: "linear-gradient(90deg, #64d2ff, #7ff0b6)",
    transition: "width 0.6s ease",
  },
  todayMarker: {
    position: "absolute",
    top: "50%",
    transform: "translate(-50%, -50%)",
    width: 14,
    height: 14,
    borderRadius: "50%",
    background: "#fff",
    border: "2px solid #64d2ff",
    boxShadow: "0 0 8px rgba(100,210,255,0.5)",
  },
  timelineHint: {
    margin: 0,
    color: "rgba(208,224,255,0.45)",
    fontSize: "0.78rem",
    paddingLeft: 38,
  },
  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 14,
    marginBottom: 20,
  },
  metricCard: {
    borderRadius: 22,
    padding: "18px 20px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.11)",
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
  },
  metricLabel: {
    margin: "0 0 12px",
    fontSize: "0.72rem",
    color: "rgba(208,224,255,0.55)",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  metricValue: {
    margin: "0 0 6px",
    fontSize: "1.5rem",
    fontWeight: 800,
    letterSpacing: "-0.04em",
    color: "#ff8e87",
  },
  metricUnit: { fontSize: "0.78rem", fontWeight: 400, opacity: 0.6 },
  metricHint: {
    margin: 0,
    fontSize: "0.75rem",
    color: "rgba(208,224,255,0.45)",
  },
  panel: {
    borderRadius: 24,
    padding: "20px 22px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.11)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    marginBottom: 16,
  },
  panelLabel: {
    margin: "0 0 16px",
    fontSize: "0.72rem",
    color: "rgba(208,224,255,0.55)",
    letterSpacing: "0.10em",
    textTransform: "uppercase",
    fontWeight: 700,
  },
  barGroup: { display: "flex", flexDirection: "column", gap: 12, marginBottom: 14 },
  barRow: { display: "flex", alignItems: "center", gap: 12 },
  barRowLabel: { width: 60, fontSize: "0.78rem", color: "rgba(208,224,255,0.6)", flexShrink: 0 },
  barTrack: {
    flex: 1,
    height: 8,
    borderRadius: 999,
    background: "rgba(255,255,255,0.07)",
    overflow: "hidden",
  },
  barFill: { height: "100%", borderRadius: 999, transition: "width 0.5s ease" },
  barRowValue: { width: 36, fontSize: "0.78rem", color: "rgba(208,224,255,0.6)", textAlign: "right", flexShrink: 0 },
  barLegend: { display: "flex", gap: 16, flexWrap: "wrap" },
  barLegendItem: { fontSize: "0.75rem", color: "rgba(208,224,255,0.55)", display: "flex", alignItems: "center", gap: 5 },
  catList: { display: "flex", flexDirection: "column", gap: 14 },
  catRow: { display: "flex", flexDirection: "column", gap: 6 },
  catMeta: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  catName: { fontWeight: 600, fontSize: "0.92rem" },
  catPressure: {
    padding: "3px 10px",
    borderRadius: "999px",
    border: "1px solid",
    fontSize: "0.72rem",
    fontWeight: 700,
  },
  catBarTrack: {
    height: 5,
    borderRadius: 999,
    background: "rgba(255,255,255,0.07)",
    overflow: "hidden",
  },
  catBarFill: { height: "100%", borderRadius: 999, transition: "width 0.5s ease" },
  catAmounts: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  catShare: { fontSize: "0.78rem", color: "rgba(208,224,255,0.45)" },
  compGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: 16,
  },
  compItem: {
    borderRadius: 16,
    padding: "14px 16px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
  },
  compLabel: {
    margin: "0 0 8px",
    fontSize: "0.7rem",
    color: "rgba(208,224,255,0.5)",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  compValue: {
    margin: "0 0 4px",
    fontSize: "1.3rem",
    fontWeight: 800,
    letterSpacing: "-0.04em",
  },
  compHint: { margin: 0, fontSize: "0.75rem", color: "rgba(208,224,255,0.45)" },
  loadingPage: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    height: "100vh",
    alignItems: "center",
    justifyContent: "center",
    background: "#081120",
  },
  spinner: {
    width: 36,
    height: 36,
    border: "3px solid rgba(100,210,255,0.12)",
    borderTop: "3px solid #64d2ff",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  errorPanel: {
    borderRadius: 22,
    padding: 24,
    background: "rgba(119,24,31,0.42)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "#ffe8ea",
  },
};
