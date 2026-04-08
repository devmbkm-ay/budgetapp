"use client";

import { forecastStatusTheme, formatPercent, type ForecastSummary, pressureLabel, type CategorySummary } from "../../lib/insights";
import { formatCurrency } from "../../lib/transactions";

interface CategoryPressureCardProps {
  categories: CategorySummary[];
  status: ForecastSummary["status"];
}

const PRESSURE_COLORS: Record<CategorySummary["pressure"], string> = {
  high: "#ff8e87",
  low: "#7ff0b6",
  medium: "#ffd36e",
};

export function CategoryPressureCard({ categories, status }: CategoryPressureCardProps) {
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
        Category Pressure
      </p>
      <h2 className="mt-2.5 mb-2.5 text-xl font-bold tracking-tight">
        Categories en tension
      </h2>
      <p className="mb-4.5 text-sm leading-relaxed text-secondary">
        Les postes qui absorbent le plus vos depenses du mois a cet instant.
      </p>
      {categories.length === 0 ? (
        <p className="text-sm leading-relaxed">
          Ajoutez des depenses ce mois-ci pour voir les categories prendre forme.
        </p>
      ) : (
        <div className="flex flex-col gap-3.5">
          {categories.map((category) => {
            const accent = PRESSURE_COLORS[category.pressure];

            return (
              <div key={category.category} className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <strong className="text-base">{category.category}</strong>
                    <p className="mt-1 text-xs text-tertiary">
                      {formatCurrency(category.amount, "EUR")} · {formatPercent(category.share)}
                    </p>
                  </div>
                  <span
                    className="badge badge-outline text-xs font-bold whitespace-nowrap"
                    style={{ color: accent, borderColor: `${accent}44` }}
                  >
                    {pressureLabel(category.pressure)}
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-white/8 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      background: `linear-gradient(90deg, ${accent}, rgba(255,255,255,0.6))`,
                      width: `${Math.max(category.share * 100, 8)}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </article>
  );
