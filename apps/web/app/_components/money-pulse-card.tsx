"use client";

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
    <article
      className="card"
      style={{
        borderColor: theme.borderColor,
        boxShadow: theme.glow,
        background: `linear-gradient(180deg, ${theme.accentSoft}, rgba(255,255,255,0.05))`,
      }}
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-secondary">
        Money Pulse
      </p>
      <h2 className="mt-2.5 mb-2.5 text-xl font-bold tracking-tight">
        Vue instantanee
      </h2>
      <p className="mb-4.5 text-sm leading-relaxed text-secondary">
        {copy.pulseLead}
      </p>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-3.5">
        <div>
          <p className="text-secondary text-xs">Solde mensuel</p>
          <strong style={{ color: totals.balance >= 0 ? "#7ff0b6" : "#ff8e87" }} className="block mt-2 text-lg -tracking-wide">
            {balancePrefix} {formatCurrency(Math.abs(totals.balance), "EUR")}
          </strong>
        </div>
        <div>
          <p className="text-secondary text-xs">Revenus</p>
          <strong style={{ color: "#7ff0b6" }} className="block mt-2 text-lg -tracking-wide">
            {formatCurrency(totals.income, "EUR")}
          </strong>
        </div>
        <div>
          <p className="text-secondary text-xs">Depenses</p>
          <strong style={{ color: "#ff8e87" }} className="block mt-2 text-lg -tracking-wide">
            {formatCurrency(totals.expenses, "EUR")}
          </strong>
        </div>
      </div>
    </article>
  );
