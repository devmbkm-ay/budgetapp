"use client";

import { useEffect, useRef, useState } from "react";
import type { MonthData } from "../api/insights/monthly/route";

function eur(n: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

const W = 600;
const H = 200;
const BOTTOM = 32; // space for month labels
const PAD_X = 8;
const CHART_H = H - BOTTOM;

export function MonthlyBarChart() {
  const [months, setMonths] = useState<MonthData[]>([]);
  const [loading, setLoading] = useState(true);
  const [hovered, setHovered] = useState<number | null>(null);
  const [animated, setAnimated] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch("/api/insights/monthly")
      .then((r) => r.json())
      .then((data: { months?: MonthData[] }) => {
        if (mounted) {
          setMonths(data.months ?? []);
          // Trigger entrance animation on next frame
          timeoutRef.current = setTimeout(() => setAnimated(true), 60);
        }
      })
      .catch(() => {})
      .finally(() => { if (mounted) setLoading(false); });
    return () => {
      mounted = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  if (loading) {
    return (
      <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: "0.80rem", color: "rgba(208,224,255,0.35)" }}>Chargement du graphique…</span>
      </div>
    );
  }

  const hasData = months.some((m) => m.income > 0 || m.expenses > 0);
  if (!hasData) return null;

  const maxVal = Math.max(...months.flatMap((m) => [m.income, m.expenses]), 1);
  const slotW = (W - PAD_X * 2) / months.length;
  const barW = Math.max(14, Math.min(30, slotW * 0.30));
  const gap = Math.max(4, barW * 0.22);

  const bH = (val: number) => (val / maxVal) * (CHART_H - 12);
  const incX = (i: number) => PAD_X + i * slotW + (slotW - barW * 2 - gap) / 2;
  const expX = (i: number) => incX(i) + barW + gap;
  const labelX = (i: number) => PAD_X + i * slotW + slotW / 2;

  // Tooltip bounds: keep within SVG
  const ttW = 116;
  const ttH = 54;
  const tooltipX = (i: number) => Math.max(0, Math.min(W - ttW, incX(i) - 10));
  const tooltipY = (m: MonthData) => {
    const topBar = CHART_H - Math.max(bH(m.income), bH(m.expenses));
    return Math.max(2, topBar - ttH - 8);
  };

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ overflow: "visible", display: "block" }}
        aria-label="Revenus et dépenses des 6 derniers mois"
      >
        {/* Dashed grid lines */}
        {[0.25, 0.5, 0.75, 1].map((pct) => {
          const y = CHART_H - (CHART_H - 12) * pct;
          return (
            <line
              key={pct}
              x1={PAD_X} y1={y} x2={W - PAD_X} y2={y}
              stroke="rgba(255,255,255,0.055)"
              strokeWidth="1"
              strokeDasharray="3 5"
            />
          );
        })}

        {/* Baseline */}
        <line
          x1={PAD_X} y1={CHART_H} x2={W - PAD_X} y2={CHART_H}
          stroke="rgba(255,255,255,0.10)"
          strokeWidth="1"
        />

        {/* Bar groups */}
        {months.map((m, i) => {
          const ih = bH(m.income);
          const eh = bH(m.expenses);
          const isHov = hovered === i;
          const isCurrent = i === months.length - 1;

          return (
            <g
              key={m.month}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(i)}
              onBlur={() => setHovered(null)}
              style={{ cursor: "default", outline: "none" }}
              role="img"
              aria-label={`${m.label}: revenus ${eur(m.income)}, dépenses ${eur(m.expenses)}`}
              tabIndex={0}
            >
              {/* Hover highlight zone */}
              {isHov && (
                <rect
                  x={incX(i) - 6}
                  y={4}
                  width={barW * 2 + gap + 12}
                  height={CHART_H - 4}
                  rx={8}
                  fill="rgba(255,255,255,0.04)"
                />
              )}

              {/* Income bar */}
              <rect
                x={incX(i)}
                y={animated ? CHART_H - ih : CHART_H}
                width={barW}
                height={animated ? ih : 0}
                rx={4}
                fill={
                  isHov
                    ? "#7ff0b6"
                    : isCurrent
                    ? "rgba(127,240,182,0.80)"
                    : "rgba(127,240,182,0.50)"
                }
                style={{
                  transition: animated
                    ? "y 0.55s cubic-bezier(0.34,1.2,0.64,1), height 0.55s cubic-bezier(0.34,1.2,0.64,1), fill 0.18s ease"
                    : "none",
                  transitionDelay: animated ? `${i * 55}ms` : "0ms",
                }}
              />

              {/* Expense bar */}
              <rect
                x={expX(i)}
                y={animated ? CHART_H - eh : CHART_H}
                width={barW}
                height={animated ? eh : 0}
                rx={4}
                fill={
                  isHov
                    ? "#ff8e87"
                    : isCurrent
                    ? "rgba(255,142,135,0.80)"
                    : "rgba(255,142,135,0.50)"
                }
                style={{
                  transition: animated
                    ? "y 0.55s cubic-bezier(0.34,1.2,0.64,1), height 0.55s cubic-bezier(0.34,1.2,0.64,1), fill 0.18s ease"
                    : "none",
                  transitionDelay: animated ? `${i * 55 + 25}ms` : "0ms",
                }}
              />

              {/* Balance dot — shown on hover */}
              {isHov && m.balance !== 0 && (
                <circle
                  cx={labelX(i)}
                  cy={CHART_H - Math.max(ih, eh) - 14}
                  r={4}
                  fill={m.balance >= 0 ? "#7ff0b6" : "#ff8e87"}
                />
              )}

              {/* Month label */}
              <text
                x={labelX(i)}
                y={H - 8}
                textAnchor="middle"
                fontSize="11"
                fontFamily="inherit"
                fill={
                  isCurrent
                    ? "rgba(208,224,255,0.85)"
                    : isHov
                    ? "#f6fbff"
                    : "rgba(208,224,255,0.40)"
                }
                style={{ transition: "fill 0.15s ease", userSelect: "none" }}
              >
                {m.label}
              </text>

              {/* Tooltip */}
              {isHov && (
                <g>
                  <rect
                    x={tooltipX(i)}
                    y={tooltipY(m)}
                    width={ttW}
                    height={ttH}
                    rx={10}
                    fill="rgba(8,16,36,0.96)"
                    stroke="rgba(255,255,255,0.12)"
                    strokeWidth="1"
                  />
                  {/* Balance line */}
                  <text
                    x={tooltipX(i) + ttW / 2}
                    y={tooltipY(m) + 14}
                    textAnchor="middle"
                    fontSize="9.5"
                    fontFamily="inherit"
                    fill="rgba(208,224,255,0.50)"
                    style={{ userSelect: "none" }}
                  >
                    {m.month.replace("-", " · ")}
                  </text>
                  {/* Income */}
                  <text
                    x={tooltipX(i) + ttW / 2}
                    y={tooltipY(m) + 30}
                    textAnchor="middle"
                    fontSize="10.5"
                    fontFamily="inherit"
                    fontWeight="700"
                    fill="#7ff0b6"
                    style={{ userSelect: "none" }}
                  >
                    ↑ {eur(m.income)}
                  </text>
                  {/* Expenses */}
                  <text
                    x={tooltipX(i) + ttW / 2}
                    y={tooltipY(m) + 46}
                    textAnchor="middle"
                    fontSize="10.5"
                    fontFamily="inherit"
                    fontWeight="700"
                    fill="#ff8e87"
                    style={{ userSelect: "none" }}
                  >
                    ↓ {eur(m.expenses)}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div style={{
        display: "flex",
        gap: 18,
        justifyContent: "center",
        marginTop: 6,
      }}>
        {[
          { color: "rgba(127,240,182,0.75)", label: "Revenus" },
          { color: "rgba(255,142,135,0.70)", label: "Dépenses" },
        ].map(({ color, label }) => (
          <span key={label} style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            fontSize: "0.72rem",
            color: "rgba(208,224,255,0.50)",
          }}>
            <span style={{
              width: 10, height: 10,
              borderRadius: 3,
              background: color,
              display: "inline-block",
              flexShrink: 0,
            }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
