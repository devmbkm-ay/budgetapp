"use client";

import type { CSSProperties } from "react";
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
    <article style={{
      ...styles.card,
      borderColor: theme.borderColor,
      boxShadow: theme.glow,
      background: `linear-gradient(180deg, ${theme.accentSoft}, rgba(255,255,255,0.05))`,
    }}>
      <p style={styles.eyebrow}>Category Pressure</p>
      <h2 style={styles.title}>Categories en tension</h2>
      <p style={styles.lead}>
        Les postes qui absorbent le plus vos depenses du mois a cet instant.
      </p>
      {categories.length === 0 ? (
        <p style={styles.empty}>Ajoutez des depenses ce mois-ci pour voir les categories prendre forme.</p>
      ) : (
        <div style={styles.list}>
          {categories.map((category) => {
            const accent = PRESSURE_COLORS[category.pressure];

            return (
              <div key={category.category} style={styles.row}>
                <div style={styles.rowTop}>
                  <div>
                    <strong style={styles.categoryName}>{category.category}</strong>
                    <p style={styles.meta}>
                      {formatCurrency(category.amount, "EUR")} · {formatPercent(category.share)}
                    </p>
                  </div>
                  <span style={{ ...styles.pressurePill, color: accent, borderColor: `${accent}44` }}>
                    {pressureLabel(category.pressure)}
                  </span>
                </div>
                <div style={styles.track}>
                  <div
                    style={{
                      ...styles.fill,
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
  empty: {
    margin: 0,
    color: "rgba(227, 236, 255, 0.76)",
    lineHeight: 1.7,
  },
  list: {
    display: "grid",
    gap: "14px",
  },
  row: {
    display: "grid",
    gap: "10px",
  },
  rowTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  categoryName: {
    fontSize: "1rem",
  },
  meta: {
    margin: "4px 0 0",
    color: "rgba(208, 224, 255, 0.58)",
    fontSize: "0.88rem",
  },
  pressurePill: {
    padding: "8px 10px",
    borderRadius: "999px",
    borderWidth: "1px",
    borderStyle: "solid",
    background: "rgba(255,255,255,0.04)",
    fontSize: "0.76rem",
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
  track: {
    width: "100%",
    height: "10px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.08)",
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: "999px",
  },
};
