"use client";

import type { CSSProperties } from "react";
import {
  comparisonNarrative,
  deltaLabel,
  forecastStatusTheme,
  type ComparisonSummary,
  type ForecastSummary,
} from "../../lib/insights";

interface MonthComparisonCardProps {
  comparison: ComparisonSummary;
  status: ForecastSummary["status"];
}

export function MonthComparisonCard({ comparison, status }: MonthComparisonCardProps) {
  const theme = forecastStatusTheme(status);

  return (
    <article
      style={{
        ...styles.card,
        borderColor: theme.borderColor,
        boxShadow: theme.glow,
        background: `linear-gradient(180deg, ${theme.accentSoft}, rgba(255,255,255,0.05))`,
      }}
    >
      <p style={styles.eyebrow}>Month over month</p>
      <h2 style={styles.title}>Ce qui change</h2>
      <p style={styles.lead}>{comparisonNarrative(comparison)}</p>

      <div style={styles.metrics}>
        <div style={styles.metricBox}>
          <span style={styles.metricLabel}>Depenses vs {comparison.previousMonth}</span>
          <strong style={styles.metricValue}>{deltaLabel(comparison.expenseDelta)}</strong>
        </div>
        <div style={styles.metricBox}>
          <span style={styles.metricLabel}>Revenus vs {comparison.previousMonth}</span>
          <strong style={styles.metricValue}>{deltaLabel(comparison.incomeDelta)}</strong>
        </div>
      </div>

      <div style={styles.notes}>
        <p style={styles.note}>
          Hausse principale: <strong>{comparison.topRisingCategory ?? "Aucune categorie dominante"}</strong>
        </p>
        <p style={styles.note}>
          Meilleure accalmie: <strong>{comparison.topImprovementCategory ?? "Aucune encore"}</strong>
        </p>
      </div>
    </article>
  );
}

const styles: Record<string, CSSProperties> = {
  card: {
    borderRadius: "28px",
    padding: "24px",
    background: "rgba(255,255,255,0.06)",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "rgba(255,255,255,0.12)",
    backdropFilter: "blur(22px)",
    WebkitBackdropFilter: "blur(22px)",
  },
  eyebrow: {
    margin: 0,
    color: "rgba(208, 224, 255, 0.68)",
    fontSize: "0.76rem",
    letterSpacing: "0.14em",
    textTransform: "uppercase",
  },
  title: {
    margin: "10px 0 10px",
    fontSize: "1.4rem",
    letterSpacing: "-0.04em",
  },
  lead: {
    margin: "0 0 18px",
    color: "rgba(227, 236, 255, 0.72)",
    lineHeight: 1.6,
  },
  metrics: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "12px",
  },
  metricBox: {
    padding: "14px",
    borderRadius: "18px",
    background: "rgba(8, 14, 29, 0.32)",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "rgba(255,255,255,0.08)",
  },
  metricLabel: {
    display: "block",
    color: "rgba(208, 224, 255, 0.62)",
    fontSize: "0.8rem",
    lineHeight: 1.5,
  },
  metricValue: {
    display: "block",
    marginTop: "8px",
    fontSize: "1.2rem",
    letterSpacing: "-0.03em",
  },
  notes: {
    display: "grid",
    gap: "8px",
    marginTop: "16px",
  },
  note: {
    margin: 0,
    color: "rgba(227, 236, 255, 0.76)",
    lineHeight: 1.6,
  },
};
