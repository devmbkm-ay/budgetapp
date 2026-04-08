"use client";

import { forecastStatusCopy, forecastStatusLabel, forecastStatusTheme, type ForecastSummary, type PeriodSummary } from "../../lib/insights";
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
  const copy = forecastStatusCopy(forecast.status);
  const theme = forecastStatusTheme(forecast.status);
  const prefix = forecast.projectedEndBalance >= 0 ? "+" : "-";

  return (
    <article
      className="card"
      style={{
        borderColor: theme.borderColor,
        boxShadow: theme.glow,
        background: `linear-gradient(180deg, ${theme.accentSoft}, rgba(255,255,255,0.05))`,
      }}
    >
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-secondary">
            Forecast
          </p>
          <h2 className="mt-2.5 text-xl font-bold tracking-tight">
            Fin de mois probable
          </h2>
        </div>
        <span
          className="badge text-xs font-bold whitespace-nowrap"
          style={{
            color: accent,
            borderColor: theme.borderColor,
            background: theme.accentSoft
          }}
        >
          {forecastStatusLabel(forecast.status)}
        </span>
      </div>
      <strong style={{ color: accent }} className="block mt-4.5 text-2xl -tracking-tighter leading-none">
        {prefix} {formatCurrency(Math.abs(forecast.projectedEndBalance), "EUR")}
      </strong>
      <p className="mt-3.5 leading-relaxed text-secondary">
        {copy.forecastLead}
      </p>
      <p className="mt-3 text-xs text-tertiary leading-relaxed">
        Base de calcul: {period.daysElapsed} jours observes, soit {formatCurrency(forecast.averageDailyExpense, "EUR")} par jour en moyenne.
      </p>
      <p className="mt-3 text-xs text-tertiary leading-relaxed">
        Depenses projetees sur {period.totalDays} jours: {formatCurrency(forecast.projectedMonthExpense, "EUR")}
      </p>
    </article>
  );
}
