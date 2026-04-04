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

export function forecastStatusCopy(status: ForecastSummary["status"]) {
  switch (status) {
    case "risky":
      return {
        forecastLead: "Le rythme actuel indique une fin de mois fragile si rien ne change.",
        pulseLead: "Votre activite du mois signale une tension reelle sur votre marge de fin de mois.",
        sectionSubtitle: "Votre assistant detecte une trajectoire qui merite une action rapide.",
      };
    case "watch":
      return {
        forecastLead: "La trajectoire reste positive, mais la marge de securite commence a se reduire.",
        pulseLead: "Votre activite du mois reste maitrisable, avec quelques signaux a surveiller.",
        sectionSubtitle: "Votre assistant voit une situation saine mais a surveiller de pres.",
      };
    default:
      return {
        forecastLead: "Le rythme actuel reste compatible avec une fin de mois encore confortable.",
        pulseLead: "Votre activite du mois reste lisible et globalement bien contenue a ce stade.",
        sectionSubtitle: "Votre assistant voit une dynamique stable et bien orientee pour le moment.",
      };
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
