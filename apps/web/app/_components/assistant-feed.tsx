"use client";

import type { CSSProperties } from "react";
import { forecastStatusTheme, type AssistantInsight, type ForecastSummary } from "../../lib/insights";

interface AssistantFeedProps {
  insights: AssistantInsight[];
  status: ForecastSummary["status"];
}

const TONE_COLORS: Record<AssistantInsight["tone"], string> = {
  neutral: "#bde8ff",
  positive: "#7ff0b6",
  warning: "#ffb2ad",
};

export function AssistantFeed({ insights, status }: AssistantFeedProps) {
  const theme = forecastStatusTheme(status);

  return (
    <section style={styles.shell}>
      <div style={styles.header}>
        <div>
          <p style={styles.eyebrow}>Assistant Feed</p>
          <h2 style={styles.title}>Notes de votre Money Pulse</h2>
          <p style={styles.subtitle}>
            Des signaux courts pour vous aider a comprendre votre trajectoire sans lire toute la timeline.
          </p>
        </div>
      </div>
      <div style={styles.grid}>
        {insights.map((insight) => (
          <article
            key={insight.id}
            style={{
              ...styles.card,
              borderColor: insight.tone === "warning" ? "rgba(255, 142, 135, 0.24)" : theme.borderColor,
              boxShadow: theme.glow,
              background: `linear-gradient(180deg, ${theme.accentSoft}, rgba(255,255,255,0.05))`,
            }}
          >
            <span style={{ ...styles.toneDot, background: TONE_COLORS[insight.tone] }} />
            <strong style={styles.cardTitle}>{insight.title}</strong>
            <p style={styles.body}>{insight.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

const styles: Record<string, CSSProperties> = {
  shell: {
    marginTop: "22px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "16px",
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
    fontSize: "1.55rem",
    letterSpacing: "-0.04em",
  },
  subtitle: {
    margin: "10px 0 0",
    color: "rgba(227, 236, 255, 0.72)",
    lineHeight: 1.6,
    maxWidth: "42rem",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "14px",
  },
  card: {
    position: "relative",
    borderRadius: "24px",
    padding: "20px",
    background: "rgba(255,255,255,0.06)",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "rgba(255,255,255,0.12)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
  },
  toneDot: {
    display: "inline-flex",
    width: "10px",
    height: "10px",
    borderRadius: "999px",
  },
  cardTitle: {
    display: "block",
    marginTop: "14px",
    fontSize: "1rem",
  },
  body: {
    margin: "10px 0 0",
    color: "rgba(227, 236, 255, 0.76)",
    lineHeight: 1.7,
  },
};
