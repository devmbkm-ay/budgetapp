import type {
  AssistantInsight,
  CategorySummary,
  ForecastSummary,
  InsightsSummary,
  PeriodSummary,
  TotalsSummary,
} from "../../../lib/finance-intelligence";

export type {
  AssistantInsight,
  CategorySummary,
  ForecastSummary,
  InsightsSummary,
  PeriodSummary,
  TotalsSummary,
};

export function formatPercent(value: number) {
  return `${Math.round(value * 100)} %`;
}

export function forecastStatusTheme(status: ForecastSummary["status"]) {
  switch (status) {
    case "risky":
      return {
        accent: "#ff8e87",
        accentSoft: "rgba(255, 142, 135, 0.14)",
        borderColor: "rgba(255, 142, 135, 0.24)",
        glow: "0 20px 40px rgba(255, 69, 58, 0.12)",
      };
    case "watch":
      return {
        accent: "#ffd36e",
        accentSoft: "rgba(255, 211, 110, 0.12)",
        borderColor: "rgba(255, 211, 110, 0.22)",
        glow: "0 20px 40px rgba(255, 211, 110, 0.10)",
      };
    default:
      return {
        accent: "#7ff0b6",
        accentSoft: "rgba(127, 240, 182, 0.12)",
        borderColor: "rgba(127, 240, 182, 0.22)",
        glow: "0 20px 40px rgba(127, 240, 182, 0.10)",
      };
  }
}

export function forecastStatusLabel(status: ForecastSummary["status"]) {
  switch (status) {
    case "risky":
      return "Sous tension";
    case "watch":
      return "A surveiller";
    default:
      return "Stable";
  }
}

export function pressureLabel(pressure: CategorySummary["pressure"]) {
  switch (pressure) {
    case "high":
      return "Forte";
    case "medium":
      return "Moyenne";
    default:
      return "Legere";
  }
}
