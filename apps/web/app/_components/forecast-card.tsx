"use client";

import type { CSSProperties } from "react";
import { forecastStatusLabel, forecastStatusTheme, type ForecastSummary, type PeriodSummary } from "../../lib/insights";
import { formatCurrency } from "../../lib/transactions";

interface ForecastCardProps {
  forecast: ForecastSummary;
  period: PeriodSummary;
}

const STATUS_COLORS: Record<ForecastSummary["status"], string> = {
  risky: "#ff8e87",
  stable: "#7ff0b6",
  watch: "#ffd36e",
};

export function ForecastCard({ forecast, period }: ForecastCardProps) {
  const accent = STATUS_COLORS[forecast.status];
  const theme = forecastStatusTheme(forecast.status);
  const prefix = forecast.projectedEndBalance >= 0 ? "+" : "-";

  return (
    <article style={{
      ...styles.card,
      borderColor: theme.borderColor,
      boxShadow: theme.glow,
      background: `linear-gradient(180deg, ${theme.accentSoft}, rgba(255,255,255,0.05))`,
    }}>
      <div style={styles.header}>
        <div>
          <p style={styles.eyebrow}>Forecast</p>
          <h2 style={styles.title}>Fin de mois probable</h2>
        </div>
        <span style={{ ...styles.status, color: accent, borderColor: theme.borderColor, background: theme.accentSoft }}>
          {forecastStatusLabel(forecast.status)}
        </span>
      </div>
      <strong style={{ ...styles.value, color: accent }}>
        {prefix} {formatCurrency(Math.abs(forecast.projectedEndBalance), "EUR")}
      </strong>
      <p style={styles.body}>
        Projection basee sur {period.daysElapsed} jours ecoules et un rythme moyen de{" "}
        {formatCurrency(forecast.averageDailyExpense, "EUR")} par jour.
      </p>
      <p style={styles.secondary}>
        Depenses projetees sur {period.totalDays} jours: {formatCurrency(forecast.projectedMonthExpense, "EUR")}
      </p>
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
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
    flexWrap: "wrap",
  },
  eyebrow: {
    margin: 0,
    color: "rgba(208, 224, 255, 0.68)",
    fontSize: "0.76rem",
    letterSpacing: "0.14em",
    textTransform: "uppercase",
  },
  title: {
    margin: "10px 0 0",
    fontSize: "1.4rem",
    letterSpacing: "-0.04em",
  },
  status: {
    padding: "10px 12px",
    borderRadius: "999px",
    borderWidth: "1px",
    borderStyle: "solid",
    background: "rgba(255,255,255,0.04)",
    fontSize: "0.8rem",
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
  value: {
    display: "block",
    marginTop: "18px",
    fontSize: "clamp(1.7rem, 6vw, 2.2rem)",
    letterSpacing: "-0.06em",
    lineHeight: 1,
  },
  body: {
    margin: "14px 0 0",
    color: "rgba(227, 236, 255, 0.76)",
    lineHeight: 1.7,
  },
  secondary: {
    margin: "12px 0 0",
    color: "rgba(208, 224, 255, 0.58)",
  },
};
