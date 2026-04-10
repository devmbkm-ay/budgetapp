"use client";

import React from "react";

interface Transaction {
  amount: number;
  date: string;
  type: "expense" | "income";
}

interface Props {
  transactions: Transaction[];
}

function toLocalDateKey(isoString: string) {
  // Use local date to avoid UTC off-by-one on day grouping
  const d = new Date(isoString);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function StreakCard({ transactions }: Props) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = toLocalDateKey(now.toISOString());
  const daysElapsed = now.getDate();

  // Filter to current month expenses only
  const monthExpenses = transactions.filter((t) => {
    if (t.type !== "expense") return false;
    const d = new Date(t.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  // Group by day
  const spentByDay: Record<string, number> = {};
  for (const t of monthExpenses) {
    const key = toLocalDateKey(t.date);
    spentByDay[key] = (spentByDay[key] ?? 0) + t.amount;
  }

  const totalSpent = monthExpenses.reduce((s, t) => s + t.amount, 0);
  const dailyAvg = totalSpent / Math.max(daysElapsed, 1);

  // Build calendar: one entry per day elapsed this month
  const calendar: { key: string; spent: number; isGreen: boolean }[] = [];
  for (let d = 1; d <= daysElapsed; d++) {
    const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const spent = spentByDay[key] ?? 0;
    // Green = spent below daily average OR no spending at all
    const isGreen = dailyAvg === 0 ? true : spent <= dailyAvg;
    calendar.push({ key, spent, isGreen });
  }

  // Current streak: consecutive green days going back from today
  let currentStreak = 0;
  for (let i = calendar.length - 1; i >= 0; i--) {
    if (calendar[i].isGreen) currentStreak++;
    else break;
  }

  // Best streak this month
  let bestStreak = 0;
  let run = 0;
  for (const day of calendar) {
    if (day.isGreen) { run++; bestStreak = Math.max(bestStreak, run); }
    else run = 0;
  }

  const greenCount = calendar.filter((d) => d.isGreen).length;
  const streakEmoji = currentStreak >= 7 ? "🔥" : currentStreak >= 3 ? "⚡" : currentStreak >= 1 ? "✨" : "💤";
  const streakColor = currentStreak >= 7 ? "#ffa040" : currentStreak >= 3 ? "#ffd36e" : currentStreak >= 1 ? "#7ff0b6" : "rgba(208,224,255,0.45)";

  return (
    <article style={s.card}>
      <p style={s.label}>Série en cours</p>
      <div style={s.heroRow}>
        <span style={s.emoji}>{streakEmoji}</span>
        <div>
          <h2 style={{ ...s.count, color: streakColor }}>
            {currentStreak}<span style={s.unit}> j</span>
          </h2>
          <p style={s.hint}>
            {currentStreak === 0
              ? "Reprenez votre élan !"
              : currentStreak === 1
              ? "C'est parti !"
              : `${currentStreak} jours consécutifs en dessous de la moyenne`}
          </p>
        </div>
      </div>

      {/* Mini calendar dots */}
      <div style={s.dots}>
        {calendar.map((day, i) => (
          <span
            key={day.key}
            title={`J${i + 1} — ${day.spent.toFixed(0)}€`}
            style={{
              ...s.dot,
              background: day.isGreen ? "#7ff0b6" : "#ff8e87",
              opacity: day.key === today ? 1 : 0.65,
              boxShadow: day.key === today ? `0 0 6px ${day.isGreen ? "#7ff0b6" : "#ff8e87"}` : "none",
              transform: day.key === today ? "scale(1.3)" : "scale(1)",
            }}
          />
        ))}
        {/* Future days — gray */}
        {Array.from({ length: new Date(year, month + 1, 0).getDate() - daysElapsed }).map((_, i) => (
          <span key={`future-${i}`} style={{ ...s.dot, background: "rgba(255,255,255,0.08)" }} />
        ))}
      </div>

      <div style={s.stats}>
        <div style={s.stat}>
          <span style={{ ...s.statValue, color: "#7ff0b6" }}>{greenCount}</span>
          <span style={s.statLabel}>jours verts</span>
        </div>
        <div style={s.stat}>
          <span style={{ ...s.statValue, color: "#ffd36e" }}>{bestStreak}</span>
          <span style={s.statLabel}>meilleure série</span>
        </div>
        <div style={s.stat}>
          <span style={s.statValue}>{dailyAvg.toFixed(0)}€</span>
          <span style={s.statLabel}>moy/jour</span>
        </div>
      </div>
    </article>
  );
}

const s: Record<string, React.CSSProperties> = {
  card: {
    borderRadius: 28,
    padding: 22,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  label: {
    margin: 0,
    color: "rgba(208,224,255,0.68)",
    fontSize: "0.82rem",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  heroRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  emoji: {
    fontSize: "2.2rem",
    lineHeight: 1,
    flexShrink: 0,
  },
  count: {
    margin: "0 0 4px",
    fontSize: "2.4rem",
    fontWeight: 800,
    letterSpacing: "-0.05em",
    lineHeight: 1,
  },
  unit: {
    fontSize: "1.1rem",
    fontWeight: 400,
    opacity: 0.7,
  },
  hint: {
    margin: 0,
    fontSize: "0.78rem",
    color: "rgba(208,224,255,0.55)",
    lineHeight: 1.4,
    maxWidth: 160,
  },
  dots: {
    display: "flex",
    flexWrap: "wrap",
    gap: 4,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    flexShrink: 0,
    transition: "transform 0.2s ease",
  },
  stats: {
    display: "flex",
    gap: 16,
    flexWrap: "wrap",
  },
  stat: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  statValue: {
    fontSize: "1.15rem",
    fontWeight: 800,
    letterSpacing: "-0.03em",
    color: "#f6fbff",
  },
  statLabel: {
    fontSize: "0.7rem",
    color: "rgba(208,224,255,0.5)",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
};
