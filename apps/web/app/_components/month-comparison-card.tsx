"use client";

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
      className="card"
      style={{
        borderColor: theme.borderColor,
        boxShadow: theme.glow,
        background: `linear-gradient(180deg, ${theme.accentSoft}, rgba(255,255,255,0.05))`,
      }}
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-secondary">
        Month over month
      </p>
      <h2 className="mt-2.5 mb-2.5 text-xl font-bold tracking-tight">
        Ce qui change
      </h2>
      <p className="mb-4.5 text-sm leading-relaxed text-secondary">
        {comparisonNarrative(comparison)}
      </p>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
        <div className="p-3.5 rounded-lg bg-black/20 border border-white/8">
          <span className="block text-xs text-tertiary leading-normal">
            Depenses vs {comparison.previousMonth}
          </span>
          <strong className="block mt-2 text-lg -tracking-wide">
            {deltaLabel(comparison.expenseDelta)}
          </strong>
        </div>
        <div className="p-3.5 rounded-lg bg-black/20 border border-white/8">
          <span className="block text-xs text-tertiary leading-normal">
            Revenus vs {comparison.previousMonth}
          </span>
          <strong className="block mt-2 text-lg -tracking-wide">
            {deltaLabel(comparison.incomeDelta)}
          </strong>
        </div>
      </div>

      <div className="flex flex-col gap-2 mt-4">
        <p className="text-sm leading-relaxed">
          Hausse principale: <strong>{comparison.topRisingCategory ?? "Aucune categorie dominante"}</strong>
        </p>
        <p className="text-sm leading-relaxed">
          Meilleure accalmie: <strong>{comparison.topImprovementCategory ?? "Aucune encore"}</strong>
        </p>
      </div>
    </article>
  );
}
