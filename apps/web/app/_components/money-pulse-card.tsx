"use client";

import type { CSSProperties } from "react";
import { forecastStatusCopy, forecastStatusTheme, type ForecastSummary, type TotalsSummary } from "../../lib/insights";
import { formatCurrency } from "../../lib/transactions";

interface MoneyPulseCardProps {
  status: ForecastSummary["status"];
  totals: TotalsSummary;
}

export function MoneyPulseCard({ status, totals }: MoneyPulseCardProps) {
  const balancePrefix = totals.balance >= 0 ? "+" : "-";
  const copy = forecastStatusCopy(status);
  const theme = forecastStatusTheme(status);

  return (
    <article style={{
      ...styles.card,
      borderColor: theme.borderColor,
      boxShadow: theme.glow,
      background: `linear-gradient(180deg, ${theme.accentSoft}, rgba(255,255,255,0.05))`,
    }}>
      <p style={styles.eyebrow}>Money Pulse</p>
      <h2 style={styles.title}>Vue instantanee</h2>
      <p style={styles.lead}>
        {copy.pulseLead}
      </p>
      <div style={styles.grid}>
        <div>
          <p style={styles.label}>Solde mensuel</p>
          <strong style={{ ...styles.value, color: totals.balance >= 0 ? "#7ff0b6" : "#ff8e87" }}>
            {balancePrefix} {formatCurrency(Math.abs(totals.balance), "EUR")}
          </strong>
        </div>
        <div>
          <p style={styles.label}>Revenus</p>
          <strong style={{ ...styles.value, color: "#7ff0b6" }}>
            {formatCurrency(totals.income, "EUR")}
          </strong>
        </div>
        <div>
          <p style={styles.label}>Depenses</p>
          <strong style={{ ...styles.value, color: "#ff8e87" }}>
            {formatCurrency(totals.expenses, "EUR")}
          </strong>
        </div>
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
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
    gap: "14px",
  },
  label: {
    margin: 0,
    color: "rgba(227, 236, 255, 0.62)",
    fontSize: "0.82rem",
  },
  value: {
    display: "block",
    marginTop: "8px",
    fontSize: "clamp(1.15rem, 3vw, 1.4rem)",
    letterSpacing: "-0.04em",
  },
};
